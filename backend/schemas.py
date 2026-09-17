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

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3

class QueryResponse(BaseModel):
    query: str
    synthesized_answer: str
    relevant_nodes: List[EntityNode]
    sources: List[str]