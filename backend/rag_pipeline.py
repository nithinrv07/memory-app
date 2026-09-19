import os

# Suppress TensorFlow warning and force PyTorch backend for transformers
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

import faiss
import numpy as np
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from google import genai
from dotenv import load_dotenv

# Load environment variables from .env in backend directory or parent directories
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

class VectorRAGEngine:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        self.dimension = 384
        self.index = faiss.IndexFlatL2(self.dimension)
        self.chunks_store: List[Dict[str, Any]] = []
        
        # Initialize Gemini Client
        api_key = os.environ.get("GEMINI_API_KEY")
        self.client = genai.Client(api_key=api_key) if api_key else None

    def add_document(self, filename: str, text: str, metadata: Optional[Dict[str, Any]] = None) -> int:
        chunks = [c.strip() for c in text.split("\n\n") if c.strip()]
        if not chunks:
            chunks = [text.strip()] if text.strip() else []

        if not chunks:
            return 0

        embeddings = self.model.encode(chunks)
        self.index.add(np.array(embeddings, dtype=np.float32))

        meta = metadata or {}
        for idx, chunk in enumerate(chunks):
            self.chunks_store.append({
                "filename": filename,
                "text": chunk,
                "chunk_index": idx,
                "title": meta.get("title", filename),
                "author": meta.get("author", "Anonymous"),
                "date": meta.get("date", "")
            })
        return len(chunks)

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if self.index.ntotal == 0:
            return []

        query_vector = self.model.encode([query])
        distances, indices = self.index.search(
            np.array(query_vector, dtype=np.float32), 
            k=min(top_k, self.index.ntotal)
        )

        results = []
        for idx in indices[0]:
            if 0 <= idx < len(self.chunks_store):
                results.append(self.chunks_store[idx])
        return results

    def clear(self):
        self.index = faiss.IndexFlatL2(self.dimension)
        self.chunks_store = []

    def synthesize_answer(self, query: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
        if not retrieved_chunks:
            return "No relevant institutional memory records found."

        context = "\n---\n".join([f"Source ({c['filename']}): {c['text']}" for c in retrieved_chunks])
        
        if not self.client:
            return f"Retrieved Context:\n{context[:300]}..."

        prompt = f"""You are an Institutional Memory & Decision Traceability AI. 
Answer the user's question clearly based ONLY on the following context. Cite the source files and architectural records if applicable.

Context:
{context}

Question: {query}
Answer:"""

        # Model trial list with fallback
        candidate_models = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']
        last_error = None

        for model_name in candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                last_error = e
                continue

        return f"Retrieved Context:\n{context[:300]}...\n\n(AI synthesis fallback: {str(last_error)})"