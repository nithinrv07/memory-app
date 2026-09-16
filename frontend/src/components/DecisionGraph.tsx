'use client';

import React, { useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface DecisionGraphProps {
  refreshTrigger: number;
}

export default function DecisionGraph({ refreshTrigger }: DecisionGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const fetchGraphData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/graph');
      const data = await res.json();

      const mappedNodes: Node[] = data.nodes.map((n: any, idx: number) => ({
        id: n.id,
        data: { label: n.label },
        position: { x: (idx % 3) * 260 + 40, y: Math.floor(idx / 3) * 130 + 40 },
        style: {
          background: 
            n.type === 'Document' ? '#ffffff' :
            n.type === 'Person' ? '#ecfccb' :
            n.type === 'Event' ? '#d1fae5' : '#e0e7ff',
          color: '#0f172a',
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
        },
      }));

      const mappedEdges: Edge[] = data.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.relation,
        animated: true,
        style: { stroke: '#84cc16', strokeWidth: 2 },
      }));

      setNodes(mappedNodes);
      setEdges(mappedEdges);
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [refreshTrigger]);

  return (
    <div className="w-full h-[500px] border border-slate-200 rounded-3xl bg-white overflow-hidden relative shadow-sm">
      <div className="absolute top-4 left-4 z-10 bg-slate-100/90 backdrop-blur px-4 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700">
        Interactive Knowledge Graph Canvas
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
      </ReactFlow>
    </div>
  );
}