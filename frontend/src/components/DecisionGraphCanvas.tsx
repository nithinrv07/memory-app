import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import {
  DocumentNodeComponent,
  DecisionNodeComponent,
  PersonNodeComponent,
  SystemNodeComponent,
  EventNodeComponent
} from './graph/CustomNodes.js';
import { EntityType, GraphEdge, GraphNode } from '../types.js';
import {
  Filter,
  Search,
  Maximize2,
  X,
  FileText,
  GitCommit,
  User,
  Server,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

interface DecisionGraphCanvasProps {
  initialNodes: GraphNode[];
  initialEdges: GraphEdge[];
  highlightedNodeIds: string[];
  onQueryNode: (label: string) => void;
}

const nodeTypes = {
  document: DocumentNodeComponent,
  decision: DecisionNodeComponent,
  person: PersonNodeComponent,
  system: SystemNodeComponent,
  event: EventNodeComponent
};

export const DecisionGraphCanvas: React.FC<DecisionGraphCanvasProps> = ({
  initialNodes,
  initialEdges,
  highlightedNodeIds,
  onQueryNode
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<EntityType, boolean>>({
    document: true,
    decision: true,
    person: true,
    system: true,
    event: true
  });

  // Convert GraphNodes to ReactFlow nodes
  const rfNodes: Node[] = useMemo(() => {
    return initialNodes
      .filter(n => activeFilters[n.type])
      .filter(n => {
        if (!searchFilter) return true;
        const q = searchFilter.toLowerCase();
        return (
          n.label.toLowerCase().includes(q) ||
          (n.subtitle && n.subtitle.toLowerCase().includes(q)) ||
          (n.metadata.details && n.metadata.details.toLowerCase().includes(q))
        );
      })
      .map(node => {
        const isHigh = highlightedNodeIds.includes(node.id);
        return {
          id: node.id,
          type: node.type,
          position: node.position || { x: 100, y: 100 },
          data: {
            ...node,
            isHighlighted: isHigh
          }
        };
      });
  }, [initialNodes, activeFilters, searchFilter, highlightedNodeIds]);

  // Convert GraphEdges to ReactFlow edges
  const rfEdges: Edge[] = useMemo(() => {
    const visibleNodeIds = new Set(rfNodes.map(n => n.id));

    return initialEdges
      .filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .map(edge => {
        const isHigh =
          highlightedNodeIds.includes(edge.source) &&
          highlightedNodeIds.includes(edge.target);

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          animated: isHigh,
          style: {
            stroke: isHigh ? '#4f46e5' : '#94a3b8',
            strokeWidth: isHigh ? 2.5 : 1.5
          },
          labelStyle: {
            fontSize: 10,
            fill: isHigh ? '#4338ca' : '#64748b',
            fontWeight: isHigh ? 700 : 500
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.9,
            rx: 4,
            ry: 4
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isHigh ? '#4f46e5' : '#94a3b8',
            width: 14,
            height: 14
          }
        };
      });
  }, [initialEdges, rfNodes, highlightedNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Update flow elements when memoized nodes or edges change
  React.useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const original = initialNodes.find(n => n.id === node.id);
      if (original) {
        setSelectedNode(original);
      }
    },
    [initialNodes]
  );

  const toggleFilter = (type: EntityType) => {
    setActiveFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Connected edges for selected node
  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return initialEdges.filter(
      e => e.source === selectedNode.id || e.target === selectedNode.id
    );
  }, [selectedNode, initialEdges]);

  return (
    <div className="relative w-full h-[720px] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-md flex flex-col">
      {/* Top Toolbar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Left Search & Title */}
        <div className="flex items-center gap-3">
          <div className="relative w-56 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search graph nodes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {highlightedNodeIds.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{highlightedNodeIds.length} Lineage Nodes Highlighted</span>
            </div>
          )}
        </div>

        {/* Right Entity Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Filters:
          </span>

          <button
            onClick={() => toggleFilter('document')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
              activeFilters.document
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                : 'bg-white text-slate-400 border-slate-200 line-through opacity-60'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Documents</span>
          </button>

          <button
            onClick={() => toggleFilter('decision')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
              activeFilters.decision
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                : 'bg-white text-slate-400 border-slate-200 line-through opacity-60'
            }`}
          >
            <GitCommit className="w-3 h-3" />
            <span>Decisions</span>
          </button>

          <button
            onClick={() => toggleFilter('person')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
              activeFilters.person
                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs'
                : 'bg-white text-slate-400 border-slate-200 line-through opacity-60'
            }`}
          >
            <User className="w-3 h-3" />
            <span>People</span>
          </button>

          <button
            onClick={() => toggleFilter('system')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
              activeFilters.system
                ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-2xs'
                : 'bg-white text-slate-400 border-slate-200 line-through opacity-60'
            }`}
          >
            <Server className="w-3 h-3" />
            <span>Systems</span>
          </button>

          <button
            onClick={() => toggleFilter('event')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
              activeFilters.event
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
                : 'bg-white text-slate-400 border-slate-200 line-through opacity-60'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Incidents</span>
          </button>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
          <Controls className="bg-white border border-slate-200 shadow-md rounded-xl p-1" />
          <MiniMap
            nodeStrokeColor="#6366f1"
            nodeColor="#e0e7ff"
            className="border border-slate-200 rounded-xl overflow-hidden shadow-md"
            maskColor="rgba(241, 245, 249, 0.7)"
          />
        </ReactFlow>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 sm:w-96 max-h-[85%] bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-5 z-20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedNode.type} Entity
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedNode.label}</h3>
                {selectedNode.subtitle && (
                  <p className="text-xs text-slate-500">{selectedNode.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-xs">
              {selectedNode.metadata?.status && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-slate-800">{selectedNode.metadata.status}</span>
                </div>
              )}

              {selectedNode.metadata?.date && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Timeline / Date</span>
                  <span className="font-mono text-slate-800">{selectedNode.metadata.date}</span>
                </div>
              )}

              {selectedNode.metadata?.author && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Author</span>
                  <span className="font-semibold text-slate-800">{selectedNode.metadata.author}</span>
                </div>
              )}

              {selectedNode.metadata?.approver && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Sign-off Approver</span>
                  <span className="font-semibold text-slate-800">{selectedNode.metadata.approver}</span>
                </div>
              )}

              {selectedNode.metadata?.details && (
                <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                    Historical Rationale & Details
                  </span>
                  <p className="text-slate-700 leading-relaxed">{selectedNode.metadata.details}</p>
                </div>
              )}

              {/* Connected Edges */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Connected Triples ({connectedEdges.length})
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {connectedEdges.map(edge => {
                    const isSrc = edge.source === selectedNode.id;
                    const otherId = isSrc ? edge.target : edge.source;
                    const otherNode = initialNodes.find(n => n.id === otherId);
                    return (
                      <div
                        key={edge.id}
                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] flex items-center justify-between"
                      >
                        <span className="font-semibold text-indigo-700">{edge.label}</span>
                        <span className="text-slate-600 truncate max-w-[140px]">
                          {otherNode?.label || otherId}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action footer */}
            <div className="pt-3 mt-3 border-t border-slate-100">
              <button
                onClick={() => onQueryNode(selectedNode.label)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Lineage For Entity</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Bottom Legend */}
      <div className="px-4 py-2 bg-white/90 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Document</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Decision</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Person</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>System</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Incident / Event</span>
          </span>
        </div>
        <span className="font-mono text-slate-400">
          Showing {nodes.length} Nodes • {edges.length} Relational Edges
        </span>
      </div>
    </div>
  );
};
