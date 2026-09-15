import os
import faiss
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Institutional Memory Engine")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Embedding Model & FAISS Vector Store
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
dimension = 384
index = faiss.IndexFlatL2(dimension)

# In-memory document store and graph nodes
document_store: List[str] = []
nodes_db: List[Dict[str, Any]] = []
edges_db: List[Dict[str, Any]] = []

class QueryRequest(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"status": "Institutional Memory Engine API is running"}

@app.post("/api/ingest")
async def ingest_document(file: UploadFile = File(...)):
    """Ingest a text/document file, create embeddings, and create graph nodes."""
    try:
        content_bytes = await file.read()
        text_content = content_bytes.decode("utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="Only UTF-8 plain text files are supported in this demo.")
    
    # Store raw text
    doc_id = len(document_store)
    document_store.append(text_content)
    
    # Generate Vector Embedding & Add to FAISS Index
    embedding = embedding_model.encode([text_content])
    index.add(np.array(embedding, dtype=np.float32))
    
    # Create nodes for visualization
    doc_node_id = f"doc_{doc_id}"
    person_node_id = f"person_{doc_id}"
    decision_node_id = f"dec_{doc_id}"
    
    new_nodes = [
        {"id": doc_node_id, "label": f"📄 {file.filename}", "type": "document"},
        {"id": person_node_id, "label": f"👤 Lead Contributor ({file.filename})", "type": "person"},
        {"id": decision_node_id, "label": f"⚡ Processed Record #{doc_id + 1}", "type": "decision"}
    ]
    
    new_edges = [
        {"id": f"e_{doc_node_id}_{person_node_id}", "source": doc_node_id, "target": person_node_id, "label": "authored by"},
        {"id": f"e_{person_node_id}_{decision_node_id}", "source": person_node_id, "target": decision_node_id, "label": "decided"}
    ]
    
    nodes_db.extend(new_nodes)
    edges_db.extend(new_edges)
    
    return {
        "status": "success",
        "filename": file.filename,
        "nodes": new_nodes,
        "edges": new_edges
    }

@app.get("/api/graph")
def get_graph():
    """Retrieve all visual graph nodes and edges."""
    return {"nodes": nodes_db, "edges": edges_db}

@app.post("/api/query")
def query_memory(req: QueryRequest):
    """Perform RAG search against stored document vectors."""
    if index.ntotal == 0:
        return {
            "answer": "No documents ingested yet. Please upload a file first.",
            "sources": []
        }
    
    query_vector = embedding_model.encode([req.query])
    distances, indices = index.search(np.array(query_vector, dtype=np.float32), k=min(3, index.ntotal))
    
    retrieved_contexts = []
    for idx in indices[0]:
        if idx < len(document_store):
            retrieved_contexts.append(document_store[idx])
            
    combined_context = "\n---\n".join(retrieved_contexts)
    
    answer = f"Based on historical records: '{combined_context[:300]}...'"
    
    return {
        "query": req.query,
        "answer": answer,
        "sources": retrieved_contexts
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="", port=8000, reload=True)