import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { FeatureCards } from './components/FeatureCards.js';
import { LineagePipelineSteps } from './components/LineagePipelineSteps.js';
import { DecisionGraphCanvas } from './components/DecisionGraphCanvas.js';
import { QueryConsole } from './components/QueryConsole.js';
import { DocumentRepository } from './components/DocumentRepository.js';
import { FileUploader } from './components/FileUploader.js';
import { WhatEngineersAsk } from './components/WhatEngineersAsk.js';
import { CtaBanner } from './components/CtaBanner.js';
import { Footer } from './components/Footer.js';
import { GraphNode, GraphEdge, DocumentRecord, QueryResult, IngestResult } from './types.js';
import { INITIAL_DOCUMENTS, INITIAL_NODES, INITIAL_EDGES } from './data/seedData.js';
import { Sparkles, Network, Layers, FileCode, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'query' | 'repository' | 'ingest'>('canvas');
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mainViewRef = useRef<HTMLDivElement>(null);

  // Fetch initial graph and stats from server
  const fetchGraphData = async () => {
    try {
      const res = await fetch('/api/graph');
      if (res.ok) {
        const data = await res.json();
        if (data.nodes && data.nodes.length > 0) setNodes(data.nodes);
        if (data.edges && data.edges.length > 0) setEdges(data.edges);
        if (data.documents && data.documents.length > 0) setDocuments(data.documents);
      }
    } catch (err) {
      console.warn('Backend API connection not yet warm, using seed data:', err);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Query handler for Gemini RAG
  const handleSearch = async (query: string) => {
    setIsLoadingQuery(true);
    setActiveTab('query');

    // Smooth scroll to main view
    if (mainViewRef.current) {
      mainViewRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 4 })
      });

      if (!res.ok) {
        throw new Error(`Query failed with status ${res.status}`);
      }

      const data: QueryResult = await res.json();
      setQueryResult(data);
      if (data.highlightedNodeIds && data.highlightedNodeIds.length > 0) {
        setHighlightedNodeIds(data.highlightedNodeIds);
      }
    } catch (err: any) {
      console.error('Error querying lineage:', err);
      showToast(err.message || 'Failed to query memory');
    } finally {
      setIsLoadingQuery(false);
    }
  };

  const handleHighlightInGraph = (nodeIds: string[]) => {
    setHighlightedNodeIds(nodeIds);
    setActiveTab('canvas');
    if (mainViewRef.current) {
      mainViewRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleIngestSuccess = (result: IngestResult) => {
    fetchGraphData();
    setIsIngestModalOpen(false);
    showToast(`Successfully ingested "${result.document.title}" (+${result.newNodesCount} nodes)`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          if (mainViewRef.current) {
            mainViewRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        openIngestModal={() => setIsIngestModalOpen(true)}
        stats={{
          nodesCount: nodes.length,
          edgesCount: edges.length,
          docsCount: documents.length,
          chunksCount: documents.length * 3
        }}
      />

      {/* Hero Section */}
      <HeroSection
        onSearch={handleSearch}
        isLoading={isLoadingQuery}
        openIngestModal={() => setIsIngestModalOpen(true)}
        onExploreGraph={() => {
          setActiveTab('canvas');
          if (mainViewRef.current) {
            mainViewRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Feature Cards Grid (matching image.png) */}
      <FeatureCards
        onSelectFeature={feature => {
          setActiveTab(feature);
          if (mainViewRef.current) {
            mainViewRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Main Interactive Stage / Workspace */}
      <section ref={mainViewRef} className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Active Tab Header Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'canvas' && 'Interactive Decision Topology Canvas'}
                {activeTab === 'query' && 'Synthesized Decision Lineage (Gemini 3.8 Flash)'}
                {activeTab === 'repository' && 'Institutional Document Repository'}
                {activeTab === 'ingest' && 'Live Document Ingestion Pipeline'}
              </h2>
            </div>

            {/* View Switcher Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setActiveTab('canvas')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'canvas'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Decision Canvas</span>
              </button>

              <button
                onClick={() => setActiveTab('query')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'query'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>RAG Synthesizer</span>
              </button>

              <button
                onClick={() => setActiveTab('repository')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'repository'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ADR Repository ({documents.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('ingest')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'ingest'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Live Ingest</span>
              </button>
            </div>
          </div>

          {/* Active Tab Body */}
          <div>
            {activeTab === 'canvas' && (
              <DecisionGraphCanvas
                initialNodes={nodes}
                initialEdges={edges}
                highlightedNodeIds={highlightedNodeIds}
                onQueryNode={label => handleSearch(`What is the architectural context and decision history regarding ${label}?`)}
              />
            )}

            {activeTab === 'query' && (
              <QueryConsole
                result={queryResult}
                isLoading={isLoadingQuery}
                onSearch={handleSearch}
                onHighlightInGraph={handleHighlightInGraph}
              />
            )}

            {activeTab === 'repository' && (
              <DocumentRepository
                documents={documents}
                onQueryDoc={docTitle => handleSearch(`Explain the lineage and rationale behind ${docTitle}`)}
              />
            )}

            {activeTab === 'ingest' && (
              <FileUploader
                onIngestSuccess={handleIngestSuccess}
              />
            )}
          </div>
        </div>
      </section>

      {/* Numbered Pipeline Section (matching image.png) */}
      <LineagePipelineSteps
        onRunSample={() => handleSearch('Why did we migrate from MongoDB to Postgres?')}
        onExploreGraph={() => {
          setActiveTab('canvas');
          if (mainViewRef.current) {
            mainViewRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Testimonials / What Engineers Ask (matching image.png) */}
      <WhatEngineersAsk
        onSelectQuery={q => handleSearch(q)}
      />

      {/* Bottom CTA Banner (matching image.png) */}
      <CtaBanner
        onOpenIngest={() => setIsIngestModalOpen(true)}
        onExploreCanvas={() => {
          setActiveTab('canvas');
          if (mainViewRef.current) {
            mainViewRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Footer */}
      <Footer />

      {/* Modal Ingest Window */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <FileUploader
            isModal
            onClose={() => setIsIngestModalOpen(false)}
            onIngestSuccess={handleIngestSuccess}
          />
        </div>
      )}
    </div>
  );
}
