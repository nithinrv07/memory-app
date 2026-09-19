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
    relation: str  

class IngestResponse(BaseModel):
    status: str
    filename: str
    extracted_entities: List[EntityNode]
    edges: List[KnowledgeEdge]
    chunks_created: Optional[int] = 0

class DocumentPayload(BaseModel):
    title: str
    content: str
    type: Optional[str] = "ADR"
    author: Optional[str] = "Anonymous Engineer"
    approver: Optional[str] = "Architecture Review Board"
    date: Optional[str] = None
    tags: Optional[List[str]] = []

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
    chunks_count: int = 0

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3

class QueryResponse(BaseModel):
    query: str
    synthesized_answer: str
    relevant_nodes: List[EntityNode]
    sources: List[str]

class HealthResponse(BaseModel):
    status: str
    version: str
    indexed_chunks: int
    total_graph_nodes: int
    total_graph_edges: int
    total_documents: int
    has_gemini_key: bool