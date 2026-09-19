import { ChunkRecord, DocumentRecord } from '../types.js';

export class VectorRagEngine {
  private chunks: ChunkRecord[] = [];
  private readonly DIMENSION = 384;

  constructor() {
    this.chunks = [];
  }

  /**
   * Split document content into clean, semantic chunks
   */
  public chunkDocument(doc: DocumentRecord): ChunkRecord[] {
    const sections = doc.content.split(/\n(?=## |\n\n)/g);
    const docChunks: ChunkRecord[] = [];
    let chunkIndex = 0;

    for (const section of sections) {
      const cleanText = section.trim();
      if (cleanText.length < 30) continue;

      // Sub-split if section is too long (> 800 chars)
      if (cleanText.length > 800) {
        const paragraphs = cleanText.split(/\n\n+/g);
        for (const p of paragraphs) {
          const pClean = p.trim();
          if (pClean.length < 30) continue;
          
          const embedding = this.generate384Embedding(pClean);
          docChunks.push({
            id: `chk-${doc.id}-${chunkIndex++}`,
            docId: doc.id,
            docTitle: doc.title,
            chunkIndex,
            text: pClean,
            embeddingDim: this.DIMENSION,
            embeddingSample: Array.from(embedding.slice(0, 8)),
            score: 0
          });
        }
      } else {
        const embedding = this.generate384Embedding(cleanText);
        docChunks.push({
          id: `chk-${doc.id}-${chunkIndex++}`,
          docId: doc.id,
          docTitle: doc.title,
          chunkIndex,
          text: cleanText,
          embeddingDim: this.DIMENSION,
          embeddingSample: Array.from(embedding.slice(0, 8)),
          score: 0
        });
      }
    }

    return docChunks;
  }

  /**
   * Generates a deterministic 384-dimensional dense normalized embedding
   * for text using semantic n-gram feature hashing and term frequency weights
   */
  public generate384Embedding(text: string): Float32Array {
    const vec = new Float32Array(this.DIMENSION);
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = clean.split(/\s+/).filter(Boolean);

    // 1-grams and 2-grams
    for (let i = 0; i < tokens.length; i++) {
      const t1 = tokens[i];
      const h1 = this.hashString(t1);
      const idx1 = Math.abs(h1) % this.DIMENSION;
      vec[idx1] += 1.5;

      if (i < tokens.length - 1) {
        const t2 = tokens[i + 1];
        const h2 = this.hashString(`${t1}_${t2}`);
        const idx2 = Math.abs(h2) % this.DIMENSION;
        vec[idx2] += 2.0;
      }
    }

    // Domain concept boost
    const concepts: Record<string, number> = {
      'postgres': 12, 'postgresql': 12, 'mongodb': 18, 'acid': 24, 'transaction': 24,
      'jwt': 42, 'rs256': 45, 'auth': 40, 'session': 38, 'envoy': 48, 'redis': 35,
      'kafka': 64, 'rabbitmq': 68, 'replay': 70, 'streaming': 65, 'event': 60,
      'incident': 80, 'outage': 82, 'circuit': 88, 'breaker': 88, 'timeout': 84, 'pgbouncer': 90,
      'grpc': 110, 'protobuf': 112, 'microservice': 105, 'cpu': 108,
      'glacier': 140, 'soc2': 142, 'audit': 138, 'compliance': 136, 'tiering': 144
    };

    for (const [kw, pos] of Object.entries(concepts)) {
      if (clean.includes(kw)) {
        vec[pos % this.DIMENSION] += 4.5;
        vec[(pos + 7) % this.DIMENSION] += 3.2;
      }
    }

    // L2 Normalize
    let norm = 0;
    for (let i = 0; i < this.DIMENSION; i++) {
      norm += vec[i] * vec[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < this.DIMENSION; i++) {
        vec[i] /= norm;
      }
    }

    return vec;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash;
  }

  /**
   * Cosine similarity between two unit-normalized vectors
   */
  public cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0;
    for (let i = 0; i < this.DIMENSION; i++) {
      dot += a[i] * b[i];
    }
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Add chunk records to index
   */
  public addChunks(newChunks: ChunkRecord[]) {
    this.chunks.push(...newChunks);
  }

  public setChunks(allChunks: ChunkRecord[]) {
    this.chunks = allChunks;
  }

  public getAllChunks(): ChunkRecord[] {
    return this.chunks;
  }

  public getChunkCount(): number {
    return this.chunks.length;
  }

  /**
   * Query top-K chunks by cosine similarity (FAISS IndexFlatL2 / Cosine equivalence)
   */
  public search(query: string, topK = 4): ChunkRecord[] {
    const queryVec = this.generate384Embedding(query);
    const scored: { chunk: ChunkRecord; score: number }[] = [];

    for (const chunk of this.chunks) {
      const chunkVec = this.generate384Embedding(chunk.text);
      let sim = this.cosineSimilarity(queryVec, chunkVec);

      // Boost if query keywords match title or chunk text directly
      const qTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      let termMatches = 0;
      for (const t of qTerms) {
        if (chunk.text.toLowerCase().includes(t)) termMatches++;
        if (chunk.docTitle.toLowerCase().includes(t)) termMatches += 2;
      }
      sim = Math.min(0.99, sim + termMatches * 0.08);

      scored.push({
        chunk: {
          ...chunk,
          score: Math.round(sim * 1000) / 1000
        },
        score: sim
      });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(s => s.chunk);
  }
}
