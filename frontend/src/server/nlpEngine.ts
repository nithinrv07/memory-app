import { DocumentRecord, GraphEdge, GraphNode, RelationType } from '../types.js';

export interface ExtractedTriple {
  subject: string;
  predicate: string;
  object: string;
  relationType: RelationType;
}

export interface NlpExtractionResult {
  triples: ExtractedTriple[];
  detectedPeople: string[];
  detectedDecisions: string[];
  detectedSystems: string[];
  detectedEvents: string[];
  newNodes: GraphNode[];
  newEdges: GraphEdge[];
}

export class NlpKnowledgeEngine {
  /**
   * Rule-based entity & relation extraction mimicking SpaCy pipeline + decision heuristics
   */
  static extractEntitiesAndTriples(
    doc: DocumentRecord,
    existingNodes: GraphNode[]
  ): NlpExtractionResult {
    const triples: ExtractedTriple[] = [];
    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];

    const docNodeId = `doc-${doc.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    // 1. Author and Approver Triples
    if (doc.author) {
      const authorClean = doc.author.split('(')[0].trim();
      const personId = `person-${authorClean.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      triples.push({
        subject: doc.title,
        predicate: 'AUTHORED_BY',
        object: authorClean,
        relationType: 'AUTHORED_BY'
      });

      if (!existingNodes.some(n => n.id === personId)) {
        newNodes.push({
          id: personId,
          type: 'person',
          label: authorClean,
          subtitle: doc.author.includes('(') ? doc.author.split('(')[1].replace(')', '').trim() : 'Author',
          metadata: { category: 'Author / Contributor' },
          position: { x: 40, y: Math.floor(Math.random() * 600) + 100 }
        });
      }

      newEdges.push({
        id: `e-author-${doc.id}`,
        source: docNodeId,
        target: personId,
        label: 'Authored By',
        relationType: 'AUTHORED_BY'
      });
    }

    if (doc.approver) {
      const approverClean = doc.approver.split('(')[0].trim();
      const approverId = `person-${approverClean.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      triples.push({
        subject: doc.title,
        predicate: 'APPROVED_BY',
        object: approverClean,
        relationType: 'APPROVED_BY'
      });

      if (!existingNodes.some(n => n.id === approverId)) {
        newNodes.push({
          id: approverId,
          type: 'person',
          label: approverClean,
          subtitle: doc.approver.includes('(') ? doc.approver.split('(')[1].replace(')', '').trim() : 'Sign-off Lead',
          metadata: { category: 'Approver' },
          position: { x: 40, y: Math.floor(Math.random() * 600) + 200 }
        });
      }

      newEdges.push({
        id: `e-approver-${doc.id}`,
        source: docNodeId,
        target: approverId,
        label: 'Approved By',
        relationType: 'APPROVED_BY'
      });
    }

    // 2. Extract Decisions from Decision Heuristics: "decided to ...", "adopt ...", "migrated from X to Y"
    const lines = doc.content.split('\n');
    let decisionCount = 0;

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Migration pattern: "migrated from [Tech A] to [Tech B]" or "switch from [A] to [B]"
      const migrationMatch = line.match(/(?:migrated?|switched?|pivoted?|transitioned?)\s+(?:the\s+[\w\s]+\s+)?from\s+([A-Za-z0-9_\-\s]+?)\s+to\s+([A-Za-z0-9_\-\s.]+)/i);
      if (migrationMatch) {
        const fromTech = migrationMatch[1].trim();
        const toTech = migrationMatch[2].trim().replace(/[.,;]$/, '');

        const decisionId = `dec-${doc.id.toLowerCase()}-mig-${++decisionCount}`;
        const decisionLabel = `Migrate from ${fromTech} to ${toTech}`;

        newNodes.push({
          id: decisionId,
          type: 'decision',
          label: decisionLabel,
          subtitle: `Status: ${doc.status}`,
          metadata: {
            status: doc.status,
            docId: doc.id,
            date: doc.date,
            details: line.trim()
          },
          position: { x: 680, y: Math.floor(Math.random() * 500) + 200 }
        });

        newEdges.push({
          id: `e-dec-${decisionId}`,
          source: docNodeId,
          target: decisionId,
          label: 'Contains Decision',
          relationType: 'CONTAINS_DECISION'
        });

        // Add systems if needed
        const fromTechId = `tech-${fromTech.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const toTechId = `tech-${toTech.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        if (!existingNodes.some(n => n.id === fromTechId) && !newNodes.some(n => n.id === fromTechId)) {
          newNodes.push({
            id: fromTechId,
            type: 'system',
            label: fromTech,
            subtitle: 'Legacy / Replaced',
            metadata: { status: 'DEPRECATED' },
            position: { x: 1040, y: Math.floor(Math.random() * 400) + 100 }
          });
        }

        if (!existingNodes.some(n => n.id === toTechId) && !newNodes.some(n => n.id === toTechId)) {
          newNodes.push({
            id: toTechId,
            type: 'system',
            label: toTech,
            subtitle: 'Target Architecture',
            metadata: { status: 'APPROVED' },
            position: { x: 1040, y: Math.floor(Math.random() * 400) + 300 }
          });
        }

        newEdges.push({
          id: `e-mig-from-${decisionId}`,
          source: decisionId,
          target: fromTechId,
          label: 'Migrated From',
          relationType: 'MIGRATED_FROM'
        });

        newEdges.push({
          id: `e-mig-to-${decisionId}`,
          source: decisionId,
          target: toTechId,
          label: 'Migrated To',
          relationType: 'MIGRATED_TO'
        });

        triples.push({
          subject: decisionLabel,
          predicate: 'MIGRATED_FROM',
          object: fromTech,
          relationType: 'MIGRATED_FROM'
        });
        triples.push({
          subject: decisionLabel,
          predicate: 'MIGRATED_TO',
          object: toTech,
          relationType: 'MIGRATED_TO'
        });
      }

      // General Decision Heuristic: "decided to [X]"
      const decisionMatch = line.match(/(?:decided to|standardized on|mandated|approved the adoption of)\s+([^.,\n]+)/i);
      if (decisionMatch && !migrationMatch) {
        const decAction = decisionMatch[1].trim();
        const decisionId = `dec-${doc.id.toLowerCase()}-${++decisionCount}`;
        const label = decAction.length > 36 ? decAction.slice(0, 36) + '...' : decAction;

        newNodes.push({
          id: decisionId,
          type: 'decision',
          label: `Adopt: ${label}`,
          subtitle: `Status: ${doc.status}`,
          metadata: {
            status: doc.status,
            docId: doc.id,
            date: doc.date,
            details: line.trim()
          },
          position: { x: 680, y: Math.floor(Math.random() * 500) + 200 }
        });

        newEdges.push({
          id: `e-dec-${decisionId}`,
          source: docNodeId,
          target: decisionId,
          label: 'Contains Decision',
          relationType: 'CONTAINS_DECISION'
        });

        triples.push({
          subject: doc.title,
          predicate: 'CONTAINS_DECISION',
          object: label,
          relationType: 'CONTAINS_DECISION'
        });
      }

      // Incident / Trigger Heuristic: "INCIDENT-[0-9]+" or "outage of [date]"
      const incidentMatch = line.match(/(INCIDENT-[0-9]+|outage of [A-Za-z0-9\s]+)/i);
      if (incidentMatch) {
        const incidentName = incidentMatch[1].trim();
        const incidentId = `evt-${incidentName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        if (!existingNodes.some(n => n.id === incidentId) && !newNodes.some(n => n.id === incidentId)) {
          newNodes.push({
            id: incidentId,
            type: 'event',
            label: incidentName,
            subtitle: 'Triggering Incident',
            metadata: { category: 'Incident' },
            position: { x: 680, y: 50 }
          });
        }

        newEdges.push({
          id: `e-trigger-${doc.id}`,
          source: docNodeId,
          target: incidentId,
          label: 'Motivated By Incident',
          relationType: 'MOTIVATED_BY'
        });

        triples.push({
          subject: doc.title,
          predicate: 'MOTIVATED_BY',
          object: incidentName,
          relationType: 'MOTIVATED_BY'
        });
      }
    }

    // Ensure document node exists
    if (!existingNodes.some(n => n.id === docNodeId) && !newNodes.some(n => n.id === docNodeId)) {
      newNodes.unshift({
        id: docNodeId,
        type: 'document',
        label: doc.title.length > 34 ? doc.title.slice(0, 34) + '...' : doc.title,
        subtitle: `${doc.type} • ${doc.date}`,
        metadata: {
          docId: doc.id,
          status: doc.status,
          date: doc.date,
          author: doc.author,
          approver: doc.approver,
          category: doc.type,
          details: doc.summary
        },
        position: { x: 320, y: Math.floor(Math.random() * 600) + 150 }
      });
    }

    return {
      triples,
      detectedPeople: newNodes.filter(n => n.type === 'person').map(n => n.label),
      detectedDecisions: newNodes.filter(n => n.type === 'decision').map(n => n.label),
      detectedSystems: newNodes.filter(n => n.type === 'system').map(n => n.label),
      detectedEvents: newNodes.filter(n => n.type === 'event').map(n => n.label),
      newNodes,
      newEdges
    };
  }
}
