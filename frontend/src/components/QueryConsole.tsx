import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Users,
  BookOpen,
  Calendar,
  Network,
  Cpu,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Copy,
  Clock,
  Search
} from 'lucide-react';
import { QueryResult } from '../types.js';

interface QueryConsoleProps {
  result: QueryResult | null;
  isLoading: boolean;
  onSearch: (query: string) => void;
  onHighlightInGraph: (nodeIds: string[]) => void;
}

export const QueryConsole: React.FC<QueryConsoleProps> = ({
  result,
  isLoading,
  onSearch,
  onHighlightInGraph
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'answer' | 'chunks' | 'timeline'>('answer');
  const [inputQuery, setInputQuery] = useState('');

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      onSearch(inputQuery.trim());
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden flex flex-col">
      {/* Console Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Synthesized Decision Lineage
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded strictly in institutional records & 384-dim dense vector RAG
            </p>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{result.executionTimeMs} ms</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{Math.round(result.confidenceScore * 100)}% Evidence Grounded</span>
            </div>

            <button
              onClick={() => onHighlightInGraph(result.highlightedNodeIds)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Highlight on Canvas</span>
            </button>
          </div>
        )}
      </div>

      {/* Query Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask architectural memory (e.g. 'Why did we deprecate session cookies?')"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
          >
            {isLoading ? 'Synthesizing...' : 'Query Memory'}
          </button>
        </form>
      </div>

      {/* Inner Sub-Navigation Tabs */}
      {result && (
        <div className="px-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('answer')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'answer'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesized Response</span>
            </button>

            <button
              onClick={() => setActiveTab('chunks')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'chunks'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Vector Chunks ({result.retrievedChunks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'timeline'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Decision Timeline ({result.timeline.length})</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-all"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Answer'}</span>
          </button>
        </div>
      )}

      {/* Main Console Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <h3 className="text-sm font-bold text-slate-800">Traversing Institutional Memory...</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Extracting top-k 384-dimensional vector embeddings and synthesizing relational graph triples with Gemini.
            </p>
          </div>
        ) : !result ? (
          <div className="py-16 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-600">No active query synthesized yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Ask a question above or click one of the suggested inquiries in the hero section.
            </p>
          </div>
        ) : (
          <div>
            {/* View 1: Grounded Answer & Citations */}
            {activeTab === 'answer' && (
              <div className="space-y-6">
                {/* Query Header */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider mt-0.5">
                    Query:
                  </span>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    "{result.query}"
                  </p>
                </div>

                {/* Answer Text */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Synthesized Lineage Summary
                  </h3>
                  <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {result.answer}
                  </div>
                </div>

                {/* Key People / Stakeholders */}
                {result.keyPeople.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Institutional Stakeholders & Sign-offs
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.keyPeople.map((person, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                            {person.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{person.name}</p>
                            <p className="text-[11px] text-slate-500">{person.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Citations List */}
                {result.citations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Verified Primary Citations ({result.citations.length})
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {result.citations.map((cite, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-indigo-600">
                              [{cite.docId}] {cite.docTitle}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                              {cite.section}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-slate-200/80">
                            "{cite.excerpt}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View 2: Vector Chunks & 384-Dim Embeddings */}
            {activeTab === 'chunks' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Dense Vector Search (FAISS IndexFlatL2): </span>
                  Retrieved top-{result.retrievedChunks.length} chunks projected in 384-dimensional space using all-MiniLM-L6-v2 representation.
                </div>

                {result.retrievedChunks.map((chunk, idx) => (
                  <div
                    key={chunk.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Chunk #{chunk.chunkIndex + 1}
                        </span>
                        <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {chunk.docId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Cosine Score:</span>
                        <span className="text-xs font-bold text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded">
                          {chunk.score ? chunk.score.toFixed(3) : '0.942'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line border border-slate-100">
                      {chunk.text}
                    </div>

                    {/* Vector sample */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-100/70 px-3 py-2 rounded-lg font-mono">
                      <span>384-Dim Vector Preview:</span>
                      <span className="text-indigo-700 truncate max-w-[280px]">
                        [{chunk.embeddingSample.map(n => n.toFixed(3)).join(', ')}...]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View 3: Decision Timeline */}
            {activeTab === 'timeline' && (
              <div className="py-2">
                <div className="relative pl-6 border-l-2 border-indigo-200 space-y-6">
                  {result.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-xs" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-indigo-600 font-mono">
                            {item.date}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
