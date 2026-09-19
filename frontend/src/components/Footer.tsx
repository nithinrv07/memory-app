import React from 'react';
import { GitBranch, Github, Twitter, Linkedin, Terminal, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-indigo-400">
                  <GitBranch className="w-4 h-4" />
                </div>
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Synapse<span className="text-indigo-400">Lineage</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated dual-engine institutional memory for modern engineering organizations. Eliminating tribal knowledge loss through knowledge graphs and vector RAG.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <div className="p-2 rounded-lg bg-slate-800 hover:text-white cursor-pointer transition-colors">
                <Github className="w-4 h-4" />
              </div>
              <div className="p-2 rounded-lg bg-slate-800 hover:text-white cursor-pointer transition-colors">
                <Twitter className="w-4 h-4" />
              </div>
              <div className="p-2 rounded-lg bg-slate-800 hover:text-white cursor-pointer transition-colors">
                <Linkedin className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Col 2: Pipeline Engine */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Dual-Engine Specs
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>SpaCy NLP Entity Extractor</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Decision Heuristics Engine</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span>384-Dim all-MiniLM-L6-v2 Vectors</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>FAISS IndexFlatL2 Cosine Search</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Gemini 3.8 Flash Lineage Synthesizer</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Records & Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Supported Records
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="hover:text-slate-200 transition-colors cursor-pointer">
                  Architectural Decision Records (ADRs)
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors cursor-pointer">
                  Requests for Comments (RFCs)
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors cursor-pointer">
                  Postmortem Incident Analyses
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors cursor-pointer">
                  Technical Specifications
                </span>
              </li>
              <li>
                <span className="hover:text-slate-200 transition-colors cursor-pointer">
                  SOC-2 Compliance Governance Trails
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Rest Endpoints
            </h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60 text-indigo-300">
                POST /api/query
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60 text-emerald-300">
                POST /api/ingest
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60 text-cyan-300">
                GET /api/graph
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
                GET /api/health
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar matching curved accent */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Institutional Memory Platform. Dual-Engine Architecture.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">FastAPI REST Gateway Spec</span>
            <span>•</span>
            <span className="text-slate-500">@xyflow/react Canvas</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
