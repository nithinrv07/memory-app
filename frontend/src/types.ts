export type EntityType = 'document' | 'person' | 'decision' | 'event' | 'system';

export type RelationType = 
  | 'AUTHORED_BY' 
  | 'APPROVED_BY' 
  | 'CONTAINS_DECISION' 
  | 'MIGRATED_FROM' 
  | 'MIGRATED_TO' 
  | 'MOTIVATED_BY' 
  | 'SUPERSEDES' 
  | 'AFFECTS' 
  | 'DEPRECATED'
  | 'RESOLVED_BY';

export interface GraphNode {
  id: string;
  type: EntityType;
  label: string;
  subtitle?: string;
  metadata: {
    status?: 'APPROVED' | 'DEPRECATED' | 'MIGRATED' | 'REJECTED' | 'PROPOSED' | 'RESOLVED' | 'ACTIVE' | 'SUPERSEDED';
    date?: string;
    author?: string;
    approver?: string;
    docId?: string;
    details?: string;
    category?: string;
    tags?: string[];
  };
  position?: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationType: RelationType;
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: 'ADR' | 'RFC' | 'POSTMORTEM' | 'TECH_SPEC';
  author: string;
  approver?: string;
  date: string;
  status: 'APPROVED' | 'SUPERSEDED' | 'ACTIVE' | 'RESOLVED';
  summary: string;
  content: string;
  tags: string[];
  chunksCount?: number;
}

export interface ChunkRecord {
  id: string;
  docId: string;
  docTitle: string;
  chunkIndex: number;
  text: string;
  embeddingDim: number;
  embeddingSample: number[];
  score?: number;
}

export interface CitationItem {
  docId: string;
  docTitle: string;
  section: string;
  excerpt: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
  nodeId?: string;
}

export interface QueryResult {
  query: string;
  answer: string;
  citations: CitationItem[];
  keyPeople: { name: string; role: string }[];
  confidenceScore: number;
  highlightedNodeIds: string[];
  timeline: TimelineItem[];
  retrievedChunks: ChunkRecord[];
  executionTimeMs: number;
  isAiGenerated: boolean;
}

export interface IngestPayload {
  title: string;
  type: 'ADR' | 'RFC' | 'POSTMORTEM' | 'TECH_SPEC';
  author: string;
  approver?: string;
  date: string;
  content: string;
  tags?: string[];
}

export interface IngestResult {
  document: DocumentRecord;
  extractedTriples: {
    subject: string;
    predicate: string;
    object: string;
  }[];
  newNodesCount: number;
  newEdgesCount: number;
  chunksCreated: number;
}
