import os
import glob
from typing import List, Dict, Any, Optional
from datetime import datetime

# 1. Environment Configuration & Warning Suppression
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

# Import modules from our project files
from schemas import (
    IngestResponse, 
    QueryRequest, 
    QueryResponse, 
    EntityNode, 
    KnowledgeEdge, 
    DocumentPayload, 
    DocumentRecord,
    HealthResponse
)
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

# Persistent In-Memory Storage Arrays for Graph Visualization and Repository
global_nodes: List[EntityNode] = []
global_edges: List[KnowledgeEdge] = []
global_documents: List[DocumentRecord] = []

def seed_sample_data():
    """Seeds sample documents from backend/sample_data if storage is currently empty."""
    sample_dir = os.path.join(os.path.dirname(__file__), "sample_data")
    if not os.path.exists(sample_dir):
        return

    txt_files = glob.glob(os.path.join(sample_dir, "*.txt"))
    for file_path in txt_files:
        filename = os.path.basename(file_path)
        # Avoid duplicate ingestion
        if any(d.title == filename or d.id == filename for d in global_documents):
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            if not content.strip():
                continue

            chunks_count = rag_engine.add_document(filename, content, {
                "title": filename.replace(".txt", ""),
                "author": "Architecture Board",
                "date": "2024-10-15"
            })

            extracted_nodes, extracted_edges = graph_builder.extract_triples(content, filename)
            
            # Avoid node duplicate IDs
            for n in extracted_nodes:
                if not any(existing.id == n.id for existing in global_nodes):
                    global_nodes.append(n)
            
            for e in extracted_edges:
                if not any(existing.id == e.id for existing in global_edges):
                    global_edges.append(e)

            doc_record = DocumentRecord(
                id=f"doc_{len(global_documents) + 1}",
                title=filename.replace(".txt", "").replace("_", " "),
                type="ADR" if "PRD" in filename or "Architecture" in filename else "AUDIT",
                author="Sarah Jenkins" if "PRD" in filename else "Marcus Vance",
                approver="Architecture Review Board",
                date="2024-10-15",
                status="APPROVED",
                summary=content[:200].replace("\n", " ") + "...",
                content=content,
                tags=["architecture", "lineage", "baseline"],
                chunks_count=chunks_count
            )
            global_documents.append(doc_record)
        except Exception as e:
            print(f"[Seed Data Error] Failed loading {filename}: {e}")

# Seed initial documents on boot
seed_sample_data()

# 5. API Endpoints

@app.get("/", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Health check route to verify backend status, indexed chunks, nodes, and documents."""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        indexed_chunks=len(rag_engine.chunks_store),
        total_graph_nodes=len(global_nodes),
        total_graph_edges=len(global_edges),
        total_documents=len(global_documents),
        has_gemini_key=bool(os.environ.get("GEMINI_API_KEY"))
    )


@app.post("/api/ingest", response_model=IngestResponse)
async def ingest_document(request: Request):
    """
    Ingests text/markdown documents from:
    1. Multipart/form-data with a file (.txt, .md).
    2. JSON payload ({ title, content, type, author, approver, date }).
    Stores chunks in FAISS and extracts Graph entities using SpaCy.
    """
    content_type = request.headers.get("content-type", "")
    filename = ""
    text_content = ""
    doc_type = "ADR"
    author = "Anonymous Contributor"
    approver = "Architecture Review Board"
    date_str = datetime.now().strftime("%Y-%m-%d")
    tags = ["architecture", "ingested"]

    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        if not uploaded_file or not hasattr(uploaded_file, "filename"):
            raise HTTPException(status_code=400, detail="No file uploaded in form data.")

        filename = uploaded_file.filename
        content_bytes = await uploaded_file.read()
        try:
            text_content = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Only UTF-8 encoded plain text/markdown is supported.")

        # Extract title from filename
        title = filename.rsplit(".", 1)[0].replace("_", " ")

    elif "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON payload.")

        text_content = body.get("content", "")
        title = body.get("title", f"Document {datetime.now().strftime('%H%M%S')}")
        filename = f"{title.replace(' ', '_')}.txt"
        doc_type = body.get("type", "ADR")
        author = body.get("author", "Anonymous Contributor")
        approver = body.get("approver", "Architecture Review Board")
        date_str = body.get("date", date_str)
        tags = body.get("tags", tags)
    else:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported Content-Type. Please use multipart/form-data or application/json."
        )

    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Document content cannot be empty.")

    # Step A: Process document into Vector RAG Store (FAISS)
    chunks_count = rag_engine.add_document(filename, text_content, {
        "title": title,
        "author": author,
        "date": date_str
    })

    # Step B: Extract Graph Entities & Triples using SpaCy
    extracted_nodes, extracted_edges = graph_builder.extract_triples(text_content, filename)
    
    # Step C: Save to central graph state
    for n in extracted_nodes:
        if not any(existing.id == n.id for existing in global_nodes):
            global_nodes.append(n)
    
    for e in extracted_edges:
        if not any(existing.id == e.id for existing in global_edges):
            global_edges.append(e)

    # Step D: Save document record
    doc_record = DocumentRecord(
        id=f"doc_{len(global_documents) + 1}",
        title=title,
        type=doc_type,
        author=author,
        approver=approver,
        date=date_str,
        status="APPROVED",
        summary=text_content[:240].replace("\n", " ").strip() + "...",
        content=text_content,
        tags=tags,
        chunks_count=chunks_count
    )
    global_documents.insert(0, doc_record)

    return IngestResponse(
        status="success",
        filename=filename,
        extracted_entities=extracted_nodes,
        edges=extracted_edges,
        chunks_created=chunks_count
    )


@app.get("/api/graph")
def get_graph():
    """Returns all extracted knowledge graph nodes, edges, and entity breakdown."""
    entity_counts = {
        "document": len([n for n in global_nodes if n.type.lower() == "document"]),
        "person": len([n for n in global_nodes if n.type.lower() == "person"]),
        "decision": len([n for n in global_nodes if n.type.lower() == "decision"]),
        "event": len([n for n in global_nodes if n.type.lower() in ["event", "date"]]),
    }

    return {
        "nodes": global_nodes,
        "edges": global_edges,
        "statistics": {
            "totalNodes": len(global_nodes),
            "totalEdges": len(global_edges),
            "entityCounts": entity_counts
        }
    }


@app.get("/api/documents")
def get_documents():
    """Returns list of all cataloged institutional memory documents."""
    return {
        "documents": global_documents
    }


@app.post("/api/query", response_model=QueryResponse)
def query_memory(req: QueryRequest):
    """
    Traces past organizational decisions:
    1. Fetches top matching vector chunks using FAISS.
    2. Generates an answer using the Gemini API based on retrieved context.
    3. Returns relevant decision nodes for graph traceability.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    # Step A: Perform vector similarity search
    retrieved_chunks = rag_engine.search(req.query, top_k=req.top_k or 3)
    
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
        if n.type.lower() in ["decision", "document", "person"]
    ][:6]

    return QueryResponse(
        query=req.query,
        synthesized_answer=synthesized_answer,
        relevant_nodes=matching_nodes,
        sources=sources
    )


@app.post("/api/reset")
def reset_memory():
    """Resets memory to default sample records."""
    global global_nodes, global_edges, global_documents
    global_nodes = []
    global_edges = []
    global_documents = []
    rag_engine.clear()
    seed_sample_data()
    return {
        "success": True,
        "message": "Reset to initial seed records complete.",
        "documents_count": len(global_documents),
        "nodes_count": len(global_nodes),
        "chunks_count": len(rag_engine.chunks_store)
    }


# 6. Server Execution Routine
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)