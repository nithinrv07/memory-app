'use client';

import React from 'react';
import { Cpu } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center font-bold text-slate-950">
          <Cpu className="w-5 h-5 text-slate-950" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">MEMSYS</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <a href="#features" className="hover:text-slate-900 transition">Features</a>
        <a href="#graph" className="hover:text-slate-900 transition">Graph Explorer</a>
        <a href="#ingest" className="hover:text-slate-900 transition">Document Ingestion</a>
        <a href="#query" className="hover:text-slate-900 transition">Trace Decision</a>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2">
          Log In
        </button>
        <button className="text-sm font-semibold bg-lime-400 hover:bg-lime-500 text-slate-950 px-5 py-2.5 rounded-full border border-lime-500 transition shadow-sm">
          Get Started
        </button>
      </div>
    </nav>
  );
}