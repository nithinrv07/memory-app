import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, GitCommit, User, Server, AlertTriangle, ShieldCheck } from 'lucide-react';
import { EntityType } from '../../types.js';

interface NodeData {
  label: string;
  subtitle?: string;
  type: EntityType;
  metadata?: {
    status?: string;
    author?: string;
    approver?: string;
    date?: string;
    category?: string;
    details?: string;
  };
  isHighlighted?: boolean;
}

export const DocumentNodeComponent = memo(({ data }: { data: NodeData }) => {
  const isHigh = data.isHighlighted;
  return (
    <div
      className={`px-4 py-3 rounded-xl bg-white shadow-md border-2 transition-all duration-300 min-w-[220px] max-w-[280px] ${
        isHigh
          ? 'border-indigo-600 ring-4 ring-indigo-100 shadow-lg scale-105'
          : 'border-indigo-200 hover:border-indigo-400'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-indigo-500" />
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
              Document
            </span>
            {data.metadata?.status && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {data.metadata.status}
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">{data.label}</h4>
          {data.subtitle && <p className="text-[11px] text-slate-500 truncate mt-0.5">{data.subtitle}</p>}
          {data.metadata?.date && (
            <p className="text-[10px] text-slate-400 font-mono mt-1">{data.metadata.date}</p>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-indigo-500" />
    </div>
  );
});

export const DecisionNodeComponent = memo(({ data }: { data: NodeData }) => {
  const isHigh = data.isHighlighted;
  return (
    <div
      className={`px-4 py-3 rounded-xl bg-white shadow-md border-2 transition-all duration-300 min-w-[220px] max-w-[280px] ${
        isHigh
          ? 'border-emerald-600 ring-4 ring-emerald-100 shadow-lg scale-105'
          : 'border-emerald-200 hover:border-emerald-400'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-emerald-500" />
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
          <GitCommit className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Decision
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Signed Off
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">{data.label}</h4>
          {data.subtitle && <p className="text-[11px] text-slate-500 truncate mt-0.5">{data.subtitle}</p>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-emerald-500" />
    </div>
  );
});

export const PersonNodeComponent = memo(({ data }: { data: NodeData }) => {
  const isHigh = data.isHighlighted;
  return (
    <div
      className={`px-4 py-3 rounded-xl bg-white shadow-md border-2 transition-all duration-300 min-w-[200px] max-w-[260px] ${
        isHigh
          ? 'border-amber-500 ring-4 ring-amber-100 shadow-lg scale-105'
          : 'border-amber-200 hover:border-amber-400'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-amber-500" />
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
          <User className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Person
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 truncate">{data.label}</h4>
          {data.subtitle && <p className="text-[11px] text-slate-500 truncate mt-0.5">{data.subtitle}</p>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-amber-500" />
    </div>
  );
});

export const SystemNodeComponent = memo(({ data }: { data: NodeData }) => {
  const isHigh = data.isHighlighted;
  const isDeprecated = data.metadata?.status === 'DEPRECATED';

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-white shadow-md border-2 transition-all duration-300 min-w-[210px] max-w-[270px] ${
        isHigh
          ? 'border-sky-600 ring-4 ring-sky-100 shadow-lg scale-105'
          : isDeprecated
          ? 'border-slate-300 opacity-80'
          : 'border-sky-200 hover:border-sky-400'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-sky-500" />
      <div className="flex items-start gap-2.5">
        <div
          className={`p-2 rounded-lg shrink-0 ${
            isDeprecated ? 'bg-slate-100 text-slate-500' : 'bg-sky-50 text-sky-600'
          }`}
        >
          <Server className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isDeprecated ? 'text-slate-600 bg-slate-100 line-through' : 'text-sky-700 bg-sky-50'
              }`}
            >
              System
            </span>
            {data.metadata?.status && (
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  isDeprecated
                    ? 'text-rose-700 bg-rose-50'
                    : 'text-sky-700 bg-sky-50'
                }`}
              >
                {data.metadata.status}
              </span>
            )}
          </div>
          <h4
            className={`text-xs font-bold truncate ${
              isDeprecated ? 'text-slate-600 line-through' : 'text-slate-900'
            }`}
          >
            {data.label}
          </h4>
          {data.subtitle && <p className="text-[11px] text-slate-500 truncate mt-0.5">{data.subtitle}</p>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-sky-500" />
    </div>
  );
});

export const EventNodeComponent = memo(({ data }: { data: NodeData }) => {
  const isHigh = data.isHighlighted;
  return (
    <div
      className={`px-4 py-3 rounded-xl bg-white shadow-md border-2 transition-all duration-300 min-w-[220px] max-w-[280px] ${
        isHigh
          ? 'border-rose-600 ring-4 ring-rose-100 shadow-lg scale-105'
          : 'border-rose-200 hover:border-rose-400'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-rose-500" />
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
              Incident / Event
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">{data.label}</h4>
          {data.subtitle && <p className="text-[11px] text-slate-500 truncate mt-0.5">{data.subtitle}</p>}
          {data.metadata?.date && (
            <p className="text-[10px] text-slate-400 font-mono mt-1">{data.metadata.date}</p>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-rose-500" />
    </div>
  );
});
