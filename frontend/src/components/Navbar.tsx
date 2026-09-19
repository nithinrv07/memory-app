import React from 'react';
import { GitBranch, Sparkles, Database, PlusCircle, Network, Layers, FileCode } from 'lucide-react';

interface NavbarProps {
  activeTab: 'canvas' | 'query' | 'repository' | 'ingest';
  setActiveTab: (tab: 'canvas' | 'query' | 'repository' | 'ingest') => void;
  openIngestModal: () => void;
  stats: {
    nodesCount: number;
    edgesCount: number;
    docsCount: number;
    chunksCount: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openIngestModal,
  stats
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('canvas')} 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-md group-hover:shadow-indigo-200 transition-all">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-indigo-600">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base font-sans">
              Synapse<span className="text-indigo-600">Lineage</span>
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'canvas'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Decision Canvas
          </button>

          <button
            onClick={() => setActiveTab('query')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'query'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Lineage RAG
          </button>

          <button
            onClick={() => setActiveTab('repository')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'repository'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            ADR Repository ({stats.docsCount})
          </button>

          <button
            onClick={() => setActiveTab('ingest')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ingest'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Live Ingest
          </button>
        </nav>

        {/* Right Status & Ingest CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-slate-700 font-semibold">{stats.chunksCount}</span> Chunks
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-700 font-semibold">{stats.nodesCount}</span> Graph Nodes
          </div>

          <button
            onClick={openIngestModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm hover:shadow-indigo-200 transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ingest Document</span>
          </button>
        </div>
      </div>
    </header>
  );
};
