import os

# 1. Environment Configuration & Warning Suppression
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Import modules from our project files
from schemas import IngestResponse, QueryRequest, QueryResponse, EntityNode, KnowledgeEdge
from graph_engine import KnowledgeGraphBuilder
from rag_pipeline import VectorRAGEngine

# 2. Initialize FastAPI Application
app = FastAPI(
    title="Institutional Memory & Decision Traceability API",
    description="Backend engine combining Knowledge Graphs and RAG for decision lineage.",
    version="1.0.0"
)

# 3. Enable CORS for Next.js Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Initialize Core Processing Engines
graph_builder = KnowledgeGraphBuilder()
rag_engine = VectorRAGEngine()

# Persistent In-Memory Storage Arrays for Graph Visualization
global_nodes: List[EntityNode] = []
global_edges: List[KnowledgeEdge] = []


# 5. API Endpoints

@app.get("/")
def health_check():
    """Health check route to verify backend status and indexed documents count."""
    return {
        "status": "Institutional Memory Engine API is running",
        "indexed_chunks": len(rag_engine.chunks_store),
        "total_graph_nodes": len(global_nodes)
    }


@app.post("/api/ingest", response_model=IngestResponse)
async def ingest_document(file: UploadFile = File(...)):
    """
    Ingests text/markdown documents:
    1. Stores text chunks in FAISS for vector semantic search.
    2. Runs SpaCy NLP to extract People, Events, and Decisions into Knowledge Graph triples.
    """
    try:
        content_bytes = await file.read()
        text_content = content_bytes.decode("utf-8")
    except Exception:
        raise HTTPException(
            status_code=400, 
            detail="Only UTF-8 encoded text files (.txt, .md) are supported."
        )

    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Step A: Process document into Vector RAG Store
    rag_engine.add_document(file.filename, text_content)

    # Step B: Extract Graph Entities & Triples using SpaCy
    extracted_nodes, extracted_edges = graph_builder.extract_triples(text_content, file.filename)
    
    # Step C: Save to central graph state
    global_nodes.extend(extracted_nodes)
    global_edges.extend(extracted_edges)

    return IngestResponse(
        status="success",
        filename=file.filename,
        extracted_entities=extracted_nodes,
        edges=extracted_edges
    )


@app.get("/api/graph")
def get_graph():
    """Returns all extracted knowledge graph nodes and edges for visual rendering."""
    return {
        "nodes": global_nodes,
        "edges": global_edges
    }


@app.post("/api/query", response_model=QueryResponse)
def query_memory(req: QueryRequest):
    """
    Traces past organizational decisions:
    1. Fetches top matching vector chunks using FAISS.
    2. Generates an answer using the Gemini API based on retrieved context.
    3. Returns relevant decision nodes for graph traceability.
    """
    # Step A: Perform vector similarity search
    retrieved_chunks = rag_engine.search(req.query, top_k=req.top_k)
    
    if not retrieved_chunks:
        return QueryResponse(
            query=req.query,
            synthesized_answer="No relevant institutional memory records found. Please ingest documents first.",
            relevant_nodes=[],
            sources=[]
        )

    # Step B: Synthesize AI Answer via Gemini Model
    synthesized_answer = rag_engine.synthesize_answer(req.query, retrieved_chunks)

    # Step C: Format source document citations
    sources = [f"[{c['filename']}] {c['text']}" for c in retrieved_chunks]
    
    # Step D: Pull matching graph nodes for UI context tracing
    matching_nodes = [
        n for n in global_nodes 
        if n.type in ["Decision", "Document", "Person"]
    ][:5]

    return QueryResponse(
        query=req.query,
        synthesized_answer=synthesized_answer,
        relevant_nodes=matching_nodes,
        sources=sources
    )


# 6. Server Execution Routine
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)