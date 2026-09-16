import os
import faiss
import numpy as np
from typing import List, Dict
from sentence_transformers import SentenceTransformer
from google import genai

class VectorRAGEngine:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        self.dimension = 384
        self.index = faiss.IndexFlatL2(self.dimension)
        self.chunks_store: List[Dict[str, str]] = []
        
        # Initialize Gemini Client
        api_key = os.environ.get("GEMINI_API_KEY")
        self.client = genai.Client() if api_key else None

    def add_document(self, filename: str, text: str):
        chunks = [c.strip() for c in text.split("\n\n") if c.strip()]
        if not chunks:
            chunks = [text]

        embeddings = self.model.encode(chunks)
        self.index.add(np.array(embeddings, dtype=np.float32))

        for chunk in chunks:
            self.chunks_store.append({
                "filename": filename,
                "text": chunk
            })

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, str]]:
        if self.index.ntotal == 0:
            return []

        query_vector = self.model.encode([query])
        distances, indices = self.index.search(np.array(query_vector, dtype=np.float32), k=min(top_k, self.index.ntotal))

        results = []
        for idx in indices[0]:
            if idx < len(self.chunks_store):
                results.append(self.chunks_store[idx])
        return results

    def synthesize_answer(self, query: str, retrieved_chunks: List[Dict[str, str]]) -> str:
        if not retrieved_chunks:
            return "No relevant institutional memory records found."

        context = "\n---\n".join([f"Source ({c['filename']}): {c['text']}" for c in retrieved_chunks])
        
        if not self.client:
            return f"Retrieved Context:\n{context[:300]}..."

        prompt = f"""You are an Institutional Memory & Decision Traceability AI. 
Answer the user's question clearly based ONLY on the following context. Cite the source files if applicable.

Context:
{context}

Question: {query}
Answer:"""

        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text