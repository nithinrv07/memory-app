'use client';

import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 3 }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-white p-8 rounded-3xl shadow-lg border border-slate-900">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-lime-400" />
        <h3 className="text-xl font-bold tracking-tight">Trace Institutional Memory</h3>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Why did we select PostgreSQL over MongoDB?"
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-lime-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-lime-400 hover:bg-lime-500 text-slate-950 font-semibold px-6 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Search className="w-4 h-4" /> {loading ? 'Synthesizing...' : 'Trace Lineage'}
        </button>
      </form>

      {response && (
        <div className="mt-6 p-5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-200">
          <h4 className="font-semibold text-lime-400 text-xs uppercase tracking-wider mb-2">Synthesized Insight</h4>
          <p className="text-sm leading-relaxed mb-4">{response.synthesized_answer}</p>

          {response.sources && response.sources.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Retrieved Sources</h5>
              <div className="space-y-2">
                {response.sources.map((src: string, idx: number) => (
                  <pre key={idx} className="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap border border-slate-800">
                    {src}
                  </pre>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}