'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import DecisionGraph from '@/components/DecisionGraph';
import FileUploader from '@/components/FileUploader';
import SearchBar from '@/components/SearchBar';
import { Play, ArrowRight, Layers, FileCheck, Network, Brain } from 'lucide-react';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#f2f4ef] text-slate-900 pb-20">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
            Your Partner in <span className="text-lime-600">Smarter Institutional</span> Decisions
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-xl">
            Prevent your organization from losing critical project context. Map documents, people, and architectural decisions automatically using vector similarity search and knowledge graphs.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a href="#ingest" className="bg-lime-400 hover:bg-lime-500 text-slate-950 font-semibold px-7 py-3.5 rounded-full border border-lime-500 transition shadow-sm text-sm">
              Ingest Document
            </a>
            <a href="#graph" className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold px-6 py-3.5 rounded-full border border-slate-300 transition shadow-sm text-sm">
              <Play className="w-4 h-4 fill-slate-900" /> Explore Graph
            </a>
          </div>

          <div className="flex flex-wrap gap-2 mt-10">
            {['Document Mapping', 'Decision Lineage', 'RAG Synthesis', 'Graph Visualizer'].map((tag, i) => (
              <span key={i} className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full shadow-2xs">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Floating Preview Card Component */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Metrics</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">Engine Active</span>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500">Extracted Entities</p>
                  <p className="text-xl font-bold text-slate-900">People, Dates, Decisions</p>
                </div>
                <Network className="w-6 h-6 text-lime-600" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 text-white flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Vector Embeddings</p>
                  <p className="text-xl font-bold text-lime-400">FAISS 384-Dim</p>
                </div>
                <Brain className="w-6 h-6 text-lime-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Features</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">Everything you need to trace institutional memory.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-lime-400 p-6 rounded-3xl border border-lime-500 flex flex-col justify-between">
            <Layers className="w-8 h-8 text-slate-950 mb-8" />
            <div>
              <h3 className="font-bold text-slate-950 text-lg mb-1">Automated Extraction</h3>
              <p className="text-xs text-slate-800 font-medium">Extract entities and decision triples automatically using SpaCy NLP.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <FileCheck className="w-8 h-8 text-lime-600 mb-8" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Vector RAG Engine</h3>
              <p className="text-xs text-slate-600 font-normal">Chunk and search documents using MiniLM vectors and FAISS similarity indexing.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <Network className="w-8 h-8 text-indigo-600 mb-8" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Knowledge Canvas</h3>
              <p className="text-xs text-slate-600 font-normal">Interactive React Flow canvas displaying connected people, events, and records.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <Brain className="w-8 h-8 text-emerald-600 mb-8" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Gemini Synthesis</h3>
              <p className="text-xs text-slate-600 font-normal">Natural-language answer generation with direct source citations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Workspaces Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div id="ingest" className="lg:col-span-5">
          <FileUploader onUploadSuccess={handleUploadSuccess} />
        </div>
        <div id="query" className="lg:col-span-7">
          <SearchBar />
        </div>
      </section>

      {/* Knowledge Graph Visualizer Section */}
      <section id="graph" className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900">Live Decision Traceability Graph</h3>
          <p className="text-xs text-slate-600">Explore the dynamic relationships extracted from uploaded institutional documents.</p>
        </div>
        <DecisionGraph refreshTrigger={refreshTrigger} />
      </section>
    </div>
  );
}