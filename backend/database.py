import os
import pickle
import faiss
import numpy as np
from typing import List, Dict, Any

FAISS_INDEX_FILE = "storage_faiss.index"
GRAPH_STORAGE_FILE = "storage_graph.pkl"

def save_system_state(index: faiss.Index, chunks: List[Dict[str, str]], nodes: List[Any], edges: List[Any]):
    """Saves the FAISS vector index and Knowledge Graph state to disk."""
    if index.ntotal > 0:
        faiss.write_index(index, FAISS_INDEX_FILE)
    
    graph_data = {
        "chunks": chunks,
        "nodes": [n.dict() if hasattr(n, 'dict') else n for n in nodes],
        "edges": [e.dict() if hasattr(e, 'dict') else e for e in edges]
    }
    with open(GRAPH_STORAGE_FILE, "wb") as f:
        pickle.dump(graph_data, f)
    print("System state successfully persisted to disk.")

def load_system_state():
    """Loads existing vector index and graph state if files exist."""
    chunks, nodes, edges = [], [], []
    index = None

    if os.path.exists(FAISS_INDEX_FILE):
        index = faiss.read_index(FAISS_INDEX_FILE)
    
    if os.path.exists(GRAPH_STORAGE_FILE):
        with open(GRAPH_STORAGE_FILE, "rb") as f:
            data = pickle.load(f)
            chunks = data.get("chunks", [])
            nodes = data.get("nodes", [])
            edges = data.get("edges", [])
            
    return index, chunks, nodes, edges