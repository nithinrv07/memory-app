import React from 'react';
import { Share2, Cpu, Sparkles, Network, ArrowRight } from 'lucide-react';

interface FeatureCardsProps {
  onSelectFeature: (feature: 'canvas' | 'query' | 'repository' | 'ingest') => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ onSelectFeature }) => {
  const cards = [
    {
      id: 'graph',
      icon: Share2,
      badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      title: 'Knowledge Graph Engine',
      category: 'SpaCy NER & Heuristics',
      description:
        'Parses text records to uncover relational triples connecting Documents, Authors, Sign-offs, Decisions, and Triggering Incidents.',
      metric: 'Auto-Extracted Triples',
      actionTab: 'canvas' as const
    },
    {
      id: 'vector',
      icon: Cpu,
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      title: 'Dense Vector RAG',
      category: '384-Dim Embeddings',
      description:
        'Chunks institutional documents and computes 384-dimensional dense vectors indexed in FAISS for millisecond semantic cosine retrieval.',
      metric: 'Sub-millisecond Search',
      actionTab: 'query' as const
    },
    {
      id: 'gemini',
      icon: Sparkles,
      badgeColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      title: 'Gemini 3.8 Flash Lineage',
      category: 'Grounded Synthesis',
      description:
        'Generates natural language summaries strictly grounded in institutional records, complete with section citations and stakeholder sign-offs.',
      metric: 'Verified Citations',
      actionTab: 'query' as const
    },
    {
      id: 'canvas',
      icon: Network,
      badgeColor: 'bg-violet-50 text-violet-600 border-violet-200',
      title: 'Interactive Topology',
      category: '@xyflow/react Canvas',
      description:
        'Visualizes organizational architecture on an interactive canvas with node filtering, edge inspection, and active lineage path highlighting.',
      metric: 'Full Graph Inspection',
      actionTab: 'canvas' as const
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dual-Engine Institutional Memory System
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Engineered to reconstruct lost architectural context with cryptographic traceability and vector precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onSelectFeature(card.actionTab)}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300 cursor-pointer"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${card.badgeColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {card.category}
                  </span>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                    {card.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {card.metric}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
