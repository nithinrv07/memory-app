from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class EntityNode(BaseModel):
    id: str
    label: str
    type: str  
    metadata: Optional[Dict[str, Any]] = {}

class KnowledgeEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = ""
    relation: Optional[str] = ""
    relationType: Optional[str] = "CONTAINS_DECISION"

class DocumentRecord(BaseModel):
    id: str
    title: str
    type: str
    author: str
    approver: str
    date: str
    status: str
    summary: str
    content: Optional[str] = None
    tags: List[str] = []
    chunks_count: Optional[int] = 0
    chunksCount: Optional[int] = 0

class IngestResponse(BaseModel):
    status: str
    filename: str
    extracted_entities: List[EntityNode]
    edges: List[KnowledgeEdge]
    chunks_created: Optional[int] = 0
    chunksCreated: Optional[int] = 0
    document: Optional[DocumentRecord] = None
    extractedTriples: Optional[List[Dict[str, str]]] = []
    newNodesCount: Optional[int] = 0
    newEdgesCount: Optional[int] = 0

class DocumentPayload(BaseModel):
    title: str
    content: str
    type: Optional[str] = "ADR"
    author: Optional[str] = "Anonymous Engineer"
    approver: Optional[str] = "Architecture Review Board"
    date: Optional[str] = None
    tags: Optional[List[str]] = []

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3
    topK: Optional[int] = 3

class QueryResponse(BaseModel):
    query: str
    answer: str
    synthesized_answer: str
    relevant_nodes: List[EntityNode]
    sources: List[str]
    citations: Optional[List[Dict[str, Any]]] = []
    highlightedNodeIds: Optional[List[str]] = []
    keyPeople: Optional[List[Dict[str, str]]] = []
    confidenceScore: Optional[float] = 0.94
    retrievedChunks: Optional[List[Dict[str, Any]]] = []
    timeline: Optional[List[Dict[str, Any]]] = []
    executionTimeMs: Optional[int] = 120
    isAiGenerated: Optional[bool] = True

class HealthResponse(BaseModel):
    status: str
    version: str
    indexed_chunks: int
    total_graph_nodes: int
    total_graph_edges: int
    total_documents: int
    has_gemini_key: bool
    vectorChunksCount: Optional[int] = 0
    documentCount: Optional[int] = 0
    graphNodesCount: Optional[int] = 0
    graphEdgesCount: Optional[int] = 0