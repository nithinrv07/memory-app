import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { INITIAL_DOCUMENTS, INITIAL_EDGES, INITIAL_NODES } from './src/data/seedData.js';
import { NlpKnowledgeEngine } from './src/server/nlpEngine.js';
import { VectorRagEngine } from './src/server/vectorEngine.js';
import { GeminiLineageSynthesizer } from './src/server/geminiService.js';
import { DocumentRecord, GraphEdge, GraphNode, IngestPayload } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory persistent state
let documents: DocumentRecord[] = [...INITIAL_DOCUMENTS];
let graphNodes: GraphNode[] = [...INITIAL_NODES];
let graphEdges: GraphEdge[] = [...INITIAL_EDGES];

const vectorEngine = new VectorRagEngine();
const geminiSynthesizer = new GeminiLineageSynthesizer();

// Initialize vector embeddings for initial seed docs
function initializeVectorIndex() {
  const allChunks = [];
  for (const doc of documents) {
    const docChunks = vectorEngine.chunkDocument(doc);
    doc.chunksCount = docChunks.length;
    allChunks.push(...docChunks);
  }
  vectorEngine.setChunks(allChunks);
  console.log(`[Vector Engine] Indexed ${allChunks.length} chunks across ${documents.length} documents (384-Dim dense vectors).`);
}

initializeVectorIndex();

// API Endpoints
// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    engine: 'Dual-Engine Lineage (SpaCy Triples + 384-Dim FAISS Vector RAG)',
    vectorChunksCount: vectorEngine.getChunkCount(),
    documentCount: documents.length,
    graphNodesCount: graphNodes.length,
    graphEdgesCount: graphEdges.length,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

// 2. Knowledge Graph Topology
app.get('/api/graph', (req, res) => {
  const entityCounts = {
    document: graphNodes.filter(n => n.type === 'document').length,
    decision: graphNodes.filter(n => n.type === 'decision').length,
    person: graphNodes.filter(n => n.type === 'person').length,
    system: graphNodes.filter(n => n.type === 'system').length,
    event: graphNodes.filter(n => n.type === 'event').length
  };

  res.json({
    nodes: graphNodes,
    edges: graphEdges,
    statistics: {
      totalNodes: graphNodes.length,
      totalEdges: graphEdges.length,
      entityCounts
    }
  });
});

// 3. Document Repository
app.get('/api/documents', (req, res) => {
  res.json({
    documents: documents.map(d => ({
      id: d.id,
      title: d.title,
      type: d.type,
      author: d.author,
      approver: d.approver,
      date: d.date,
      status: d.status,
      summary: d.summary,
      tags: d.tags,
      chunksCount: d.chunksCount || 0
    }))
  });
});

// 4. Natural Language Lineage Query (Vector RAG + Gemini 3.8 Flash)
app.post('/api/query', async (req, res) => {
  try {
    const { query, topK = 4 } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    // Step 1: Dense Vector RAG Search (Cosine Similarity top-k)
    const retrievedChunks = vectorEngine.search(query, topK);

    // Step 2: Gemini Synthesis grounded in retrieved chunks + graph
    const synthesisResult = await geminiSynthesizer.synthesize(
      query,
      retrievedChunks,
      graphNodes,
      graphEdges
    );

    res.json(synthesisResult);
  } catch (error: any) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message || 'Internal query error' });
  }
});

// 5. Ingest Document (NER & Heuristic Triples + 384-Dim Vector Indexing)
app.post('/api/ingest', (req, res) => {
  try {
    const payload: IngestPayload = req.body;
    if (!payload.title || !payload.content) {
      return res.status(400).json({ error: 'Document title and content are required' });
    }

    const docId = payload.title.match(/^(?:ADR|RFC|POSTMORTEM|INCIDENT)-[A-Za-z0-9]+/i)?.[0]?.toUpperCase() 
      || `DOC-${Date.now().toString().slice(-4)}`;

    const newDoc: DocumentRecord = {
      id: docId,
      title: payload.title,
      type: payload.type || 'ADR',
      author: payload.author || 'Anonymous Contributor',
      approver: payload.approver || 'Architecture Review Board',
      date: payload.date || new Date().toISOString().split('T')[0],
      status: 'APPROVED',
      summary: payload.content.slice(0, 240).replace(/#+/g, '').trim() + '...',
      content: payload.content,
      tags: payload.tags || ['architecture', 'ingested']
    };

    // Vector Chunker
    const newChunks = vectorEngine.chunkDocument(newDoc);
    newDoc.chunksCount = newChunks.length;
    vectorEngine.addChunks(newChunks);
    documents.unshift(newDoc);

    // Knowledge Graph Extraction
    const extraction = NlpKnowledgeEngine.extractEntitiesAndTriples(newDoc, graphNodes);

    // Merge new nodes and edges avoiding duplicates
    for (const node of extraction.newNodes) {
      if (!graphNodes.some(n => n.id === node.id)) {
        graphNodes.push(node);
      }
    }

    for (const edge of extraction.newEdges) {
      if (!graphEdges.some(e => e.id === edge.id || (e.source === edge.source && e.target === edge.target))) {
        graphEdges.push(edge);
      }
    }

    res.json({
      success: true,
      document: newDoc,
      chunksCreated: newChunks.length,
      extractedTriples: extraction.triples,
      newNodesCount: extraction.newNodes.length,
      newEdgesCount: extraction.newEdges.length
    });
  } catch (error: any) {
    console.error('Ingest error:', error);
    res.status(500).json({ error: error.message || 'Ingestion failure' });
  }
});

// 6. Reset to Default Seed Data
app.post('/api/reset', (req, res) => {
  documents = [...INITIAL_DOCUMENTS];
  graphNodes = [...INITIAL_NODES];
  graphEdges = [...INITIAL_EDGES];
  initializeVectorIndex();
  res.json({ success: true, message: 'Reset to initial seed records complete' });
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Institutional Memory Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
