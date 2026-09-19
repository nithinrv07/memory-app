import React, { useState } from 'react';
import { FileText, Search, Tag, Calendar, User, CheckCircle2, ArrowRight, Eye, X } from 'lucide-react';
import { DocumentRecord } from '../types.js';

interface DocumentRepositoryProps {
  documents: DocumentRecord[];
  onQueryDoc: (docTitle: string) => void;
}

export const DocumentRepository: React.FC<DocumentRepositoryProps> = ({
  documents,
  onQueryDoc
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'ADR' | 'POSTMORTEM' | 'RFC'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  const filteredDocs = documents.filter(doc => {
    const matchesType = filterType === 'ALL' || doc.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      doc.title.toLowerCase().includes(q) ||
      doc.summary.toLowerCase().includes(q) ||
      doc.author.toLowerCase().includes(q) ||
      doc.tags.some(t => t.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Institutional Architectural Repository
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Preserved ADRs, RFCs, and postmortems indexed across vector and graph lineage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'ADR', 'POSTMORTEM'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-56 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter repository..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    doc.type === 'POSTMORTEM'
                      ? 'text-rose-700 bg-rose-50 border border-rose-200'
                      : 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                  }`}
                >
                  {doc.type}
                </span>

                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {doc.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                {doc.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {doc.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Details & Action */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[140px]">{doc.author.split('(')[0]}</span>
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{doc.date}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Record</span>
                </button>

                <button
                  onClick={() => onQueryDoc(doc.title)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <span>Ask Lineage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Reader Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                  {selectedDoc.type} • {selectedDoc.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedDoc.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-800 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-4 justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Author</span>
                  <span className="font-semibold text-slate-900">{selectedDoc.author}</span>
                </div>
                {selectedDoc.approver && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Approver</span>
                    <span className="font-semibold text-slate-900">{selectedDoc.approver}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
                  <span className="font-mono text-slate-900">{selectedDoc.date}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl font-mono text-xs whitespace-pre-line text-slate-700 leading-relaxed border border-slate-200">
                {selectedDoc.content}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Indexed in FAISS 384-Dim Vector Index
              </span>
              <button
                onClick={() => {
                  const title = selectedDoc.title;
                  setSelectedDoc(null);
                  onQueryDoc(title);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                Synthesize Lineage for this Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
