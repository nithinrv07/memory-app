import React, { useState } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle2, ArrowRight, X, AlertCircle, Play } from 'lucide-react';
import { IngestPayload, IngestResult } from '../types.js';

interface FileUploaderProps {
  onIngestSuccess: (result: IngestResult) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onIngestSuccess,
  onClose,
  isModal = false
}) => {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<'ADR' | 'RFC' | 'POSTMORTEM' | 'TECH_SPEC'>('ADR');
  const [author, setAuthor] = useState('');
  const [approver, setApprover] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<IngestResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleTemplates = [
    {
      label: 'ADR: GraphQL to Envoy REST Gateway',
      type: 'ADR' as const,
      author: 'Marcus Vance (VP Engineering)',
      approver: 'Lisa Gomez (CISO)',
      title: 'ADR-104: Migration from GraphQL Federation to Envoy REST Gateway',
      content: `# ADR-104: Migration from GraphQL Federation to Envoy REST Gateway
Status: APPROVED
Date: 2024-10-15
Author: Marcus Vance (VP Engineering)
Approver: Lisa Gomez (CISO)

## Context & Problem Statement
The federation gateway suffered high CPU overhead due to N+1 query execution patterns across subgraphs. Client caching was ineffective, resulting in 4x egress bandwidth.

## Decision
We decided to deprecate the GraphQL Federation gateway and migrated to an Envoy-based REST gateway with automated OpenAPI specification contracts.
- Primary Routing: Envoy Ingress with distributed rate limiting.
- Protocol: REST/JSON externally, translating to gRPC for backend microservices.

## Consequences & Trade-offs
- Positive: Eliminated N+1 query overhead; 40% reduction in gateway latency.
- Positive: Seamless HTTP/2 edge caching via CDN.`
    },
    {
      label: 'Postmortem: Redis Memory Spill Incident',
      type: 'POSTMORTEM' as const,
      author: 'David Kim (Staff SRE)',
      approver: 'Sarah Chen (Principal Architect)',
      title: 'POSTMORTEM-2024-Q4: Redis In-Memory Eviction Spill',
      content: `# POSTMORTEM-2024-Q4: Redis In-Memory Eviction Spill
Status: RESOLVED
Date: 2024-11-20
Incident Lead: David Kim (Staff SRE)
Sign-off: Sarah Chen, Marcus Vance

## Summary
On November 20, 2024, the primary Redis cluster ran out of memory due to unbounded session token keys lacking TTL expiration policies. This triggered allkeys-lru evictions, dropping valid user sessions and causing 12,000 users to be logged out simultaneously.

## Action Items & Lineage Changes
1. Mandated maximum 24h TTL policy on all ephemeral cache writes (PR-1402).
2. Switched session revocation to a compressed Bloom filter (Decided in ADR-058 amendment).
3. Configured Datadog alerts at 75% maxmemory threshold.`
    }
  ];

  const handleApplyTemplate = (tmpl: typeof sampleTemplates[0]) => {
    setTitle(tmpl.title);
    setDocType(tmpl.type);
    setAuthor(tmpl.author);
    setApprover(tmpl.approver);
    setContent(tmpl.content);
    setErrorMsg('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setContent(text);

      // Try parsing title from first heading
      const headingMatch = text.match(/^#+\s*(.+)$/m);
      if (headingMatch) {
        setTitle(headingMatch[1].trim());
      } else {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }

      // Try parsing author
      const authorMatch = text.match(/Author:\s*([^\n]+)/i);
      if (authorMatch) setAuthor(authorMatch[1].trim());

      // Try parsing approver
      const approverMatch = text.match(/Approver:\s*([^\n]+)/i);
      if (approverMatch) setApprover(approverMatch[1].trim());
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Document title and content are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload: IngestPayload = {
        title: title.trim(),
        type: docType,
        author: author.trim() || 'Anonymous Engineer',
        approver: approver.trim() || 'Architecture Review Board',
        date,
        content: content.trim()
      };

      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Ingestion failed with status ${res.status}`);
      }

      const data: IngestResult = await res.json();
      setLastResult(data);
      onIngestSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to ingest document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col ${isModal ? 'max-w-3xl w-full max-h-[90vh]' : 'w-full'}`}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Live Document Ingestion</h2>
            <p className="text-xs text-slate-400">
              NLP Triples Extraction • 384-Dim Vector RAG Indexing
            </p>
          </div>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* Quick Sample Templates */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Load Pre-Configured Architectural Record:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleTemplates.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current text-indigo-600" />
                <span>{tmpl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. ADR-042: MongoDB to PostgreSQL 16"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Document Category
              </label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="ADR">ADR (Architectural Decision Record)</option>
                <option value="POSTMORTEM">POSTMORTEM (Incident Analysis)</option>
                <option value="RFC">RFC (Request for Comments)</option>
                <option value="TECH_SPEC">TECH_SPEC (Technical Specification)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Author (Person Node)
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="e.g. Sarah Chen (Principal Architect)"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Sign-off Approver
              </label>
              <input
                type="text"
                value={approver}
                onChange={e => setApprover(e.target.value)}
                placeholder="e.g. Marcus Vance (VP Engineering)"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* File input drag and drop or manual browse */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Markdown / Text Content
              </label>
              <label className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload .md / .txt</span>
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={8}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste ADR markdown with Context, Problem, Decision ('decided to...', 'migrated from X to Y'), and Consequences..."
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Extracting Triples & Vectors...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ingest & Build Lineage</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Extraction Result preview */}
        {lastResult && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 animate-in fade-in duration-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Document Ingested Successfully!
                </h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                +{lastResult.chunksCreated} Vector Chunks
              </span>
            </div>

            <p className="text-xs text-slate-700">
              Generated <strong className="font-semibold">{lastResult.chunksCreated} 384-dim vector chunks</strong> in FAISS and added <strong className="font-semibold">{lastResult.newNodesCount} new nodes</strong> and <strong className="font-semibold">{lastResult.newEdgesCount} relational edges</strong> to the Knowledge Graph.
            </p>

            {/* Extracted Triples */}
            {lastResult.extractedTriples.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1.5">
                  Extracted Relational Triples:
                </span>
                <div className="space-y-1">
                  {lastResult.extractedTriples.map((t, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded-lg bg-white border border-emerald-200/80 text-[11px] font-mono text-slate-800 flex items-center gap-2"
                    >
                      <span className="font-semibold text-indigo-700">({t.subject})</span>
                      <span className="text-slate-400">--[{t.predicate}]--&gt;</span>
                      <span className="font-semibold text-emerald-700">({t.object})</span>
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
