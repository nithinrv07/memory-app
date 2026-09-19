import React from 'react';
import { ArrowRight, Sparkles, UploadCloud } from 'lucide-react';

interface CtaBannerProps {
  onOpenIngest: () => void;
  onExploreCanvas: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onOpenIngest, onExploreCanvas }) => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner container matching image.png bar */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 p-8 sm:p-10 text-white shadow-xl shadow-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ready to eliminate architectural amnesia?
            </h2>
            <p className="text-sm text-indigo-100 mt-1 max-w-xl">
              Ingest your team's ADRs and postmortems to construct your live institutional knowledge graph.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onExploreCanvas}
              className="px-5 py-3 rounded-xl bg-white text-indigo-700 hover:bg-slate-50 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              Explore Decision Canvas
            </button>

            <button
              onClick={onOpenIngest}
              className="px-5 py-3 rounded-xl bg-indigo-900/60 hover:bg-indigo-900/80 text-white border border-white/20 font-bold text-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Document</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
