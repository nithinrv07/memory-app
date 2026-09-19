import React from 'react';
import { CheckCircle2, ArrowRight, Play, Database, FileText, Share2, Sparkles } from 'lucide-react';

interface LineagePipelineStepsProps {
  onRunSample: () => void;
  onExploreGraph: () => void;
}

export const LineagePipelineSteps: React.FC<LineagePipelineStepsProps> = ({
  onRunSample,
  onExploreGraph
}) => {
  const steps = [
    {
      num: '1',
      title: 'Ingest Architectural Records',
      desc: 'Upload markdown ADRs, RFCs, and postmortem incident analyses via REST endpoint or drag-and-drop.'
    },
    {
      num: '2',
      title: 'Knowledge Graph Extraction',
      desc: 'SpaCy-style NER and decision heuristics identify entities and map relational triples (Doc -> Edge -> Entity).'
    },
    {
      num: '3',
      title: 'Dense Vector Chunk Indexing',
      desc: 'Splits text into semantic segments and projects 384-dimensional embeddings into a cosine similarity vector index.'
    },
    {
      num: '4',
      title: 'Grounded Gemini Synthesis',
      desc: 'Gemini 3.8 Flash delivers natural language reasoning strictly backed by verified citations and sign-offs.'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tinted container matching image.png card layout */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-indigo-100/40 border border-indigo-100/80 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Visual Data Pipeline Preview */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm rounded-2xl bg-white border border-indigo-100 p-5 shadow-lg shadow-indigo-100/60">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">Pipeline Execution Flow</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                    Live Decoupled
                  </span>
                </div>

                {/* Pipeline Flow Blocks */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">1. Raw Document (.md)</p>
                      <p className="text-[11px] text-slate-500 truncate">ADR-042: MongoDB to PostgreSQL 16</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">INPUT</span>
                  </div>

                  <div className="flex justify-center text-indigo-400">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                      <div className="flex items-center gap-1.5 mb-1 text-indigo-700">
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">Graph Triples</span>
                      </div>
                      <p className="text-[10px] text-slate-600">Doc → Decision → System</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <div className="flex items-center gap-1.5 mb-1 text-emerald-700">
                        <Database className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">384-Dim FAISS</span>
                      </div>
                      <p className="text-[10px] text-slate-600">Cosine Similarity Search</p>
                    </div>
                  </div>

                  <div className="flex justify-center text-indigo-400">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm">
                    <div className="p-2 rounded-lg bg-white/20 text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold">Gemini Lineage Synthesis</p>
                      <p className="text-[11px] text-indigo-100 truncate">Grounded answer + citations + topology highlight</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Numbered Steps matching image.png */}
            <div className="lg:col-span-7">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Simple, Robust <span className="text-indigo-600">Lineage Solutions!</span>
              </h3>
              <p className="text-sm text-slate-600 mb-8 max-w-xl">
                We understand that engineering organizations scale rapidly. Our dual-engine system automates context capture so knowledge remains permanent, searchable, and verified.
              </p>

              {/* Steps List */}
              <div className="space-y-4 mb-8">
                {steps.map(step => (
                  <div key={step.num} className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm mt-0.5">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons matching image.png */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onRunSample}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Sample Query</span>
                </button>
                <button
                  onClick={onExploreGraph}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  <span>Explore Topology Canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
