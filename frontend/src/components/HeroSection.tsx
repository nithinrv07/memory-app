import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, UploadCloud, Terminal, ShieldCheck, GitCommit } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  openIngestModal: () => void;
  onExploreGraph: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  isLoading,
  openIngestModal,
  onExploreGraph
}) => {
  const [inputQuery, setInputQuery] = useState('');

  const sampleQueries = [
    'Why did we migrate from MongoDB to Postgres?',
    'Who approved the RS256 JWT auth architecture?',
    'Why was Kafka chosen over RabbitMQ?',
    'What caused the Q3 2024 payment cascade failure?'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      onSearch(inputQuery.trim());
    }
  };

  const handleChipClick = (q: string) => {
    setInputQuery(q);
    onSearch(q);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50 border-b border-slate-200">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-gradient-to-r from-indigo-200/30 via-cyan-100/20 to-indigo-200/30 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Preserve <span className="text-indigo-600">Institutional Memory</span> & Engineering Lineage
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
          Eliminate architectural amnesia and tribal knowledge loss. Uncover relational triples connecting{' '}
          <strong className="text-slate-800 font-semibold">Documents</strong>,{' '}
          <strong className="text-slate-800 font-semibold">Decisions</strong>,{' '}
          <strong className="text-slate-800 font-semibold">People</strong>, and{' '}
          <strong className="text-slate-800 font-semibold">Incidents</strong> with 384-dim dense vector RAG and
          grounded Gemini synthesis.
        </p>

        {/* Interactive Query Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto mb-6 relative flex items-center bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-200 p-2 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all"
        >
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask anything: 'Why did we switch databases 6 months ago?'"
            className="w-full py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Ask Memory</span>
              </>
            )}
          </button>
        </form>

        {/* Quick query suggestion chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto mb-10">
          <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" />
            Try inquiries:
          </span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(q)}
              className="text-xs font-medium text-slate-700 hover:text-indigo-600 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExploreGraph}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-indigo-200 transition-all cursor-pointer active:scale-95"
          >
            <GitCommit className="w-4 h-4" />
            <span>Explore Decision Topology</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={openIngestModal}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Ingest ADR / Postmortem</span>
          </button>
        </div>
      </div>
    </section>
  );
};
