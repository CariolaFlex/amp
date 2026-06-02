'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ARQUITECTURA_NODES, ARQUITECTURA_EDGES } from '@/lib/arquitectura/data';
import { ModuleNode } from './ModuleNode';
import type { NodeTypes } from '@xyflow/react';
import type { ModuleNodeData } from '@/lib/arquitectura/data';

// React Flow requiere dynamic import obligatorio (SSR incompatible)
const ReactFlow = dynamic(
  () => import('@xyflow/react').then((m) => m.ReactFlow),
  { ssr: false }
);
const Background = dynamic(
  () => import('@xyflow/react').then((m) => m.Background),
  { ssr: false }
);
const Controls = dynamic(
  () => import('@xyflow/react').then((m) => m.Controls),
  { ssr: false }
);
const MiniMap = dynamic(
  () => import('@xyflow/react').then((m) => m.MiniMap),
  { ssr: false }
);

const NODE_TYPES: NodeTypes = { moduleNode: ModuleNode as NodeTypes['moduleNode'] };

type LayerFilter = 'all' | ModuleNodeData['layer'];
type ModuleFilter = string;

const LAYER_META: { id: LayerFilter; label: string; color: string }[] = [
  { id: 'all',      label: 'Todo el sistema',   color: '#64748b' },
  { id: 'db',       label: 'Base de Datos',      color: '#3b82f6' },
  { id: 'api',      label: 'Backend API',        color: '#f97316' },
  { id: 'frontend', label: 'Frontend',           color: '#10b981' },
  { id: 'external', label: 'Integraciones',      color: '#a855f7' },
];

const LEGEND_ITEMS = [
  { color: '#3b82f6', label: 'DB → API (mssql)' },
  { color: '#10b981', label: 'API → Frontend (fetch)' },
  { color: '#a855f7', label: 'API → Externo (HTTP/SOAP)' },
  { color: '#f59e0b', label: 'Ventas → (stock / CxC / asiento)' },
  { color: '#ef4444', label: 'Compras → (stock / CxP / asiento)' },
  { color: '#8b5cf6', label: 'Tesorería → Contabilidad' },
  { color: '#ec4899', label: 'RRHH → Contabilidad' },
  { color: '#06b6d4', label: 'CRM ↔ Ventas' },
];

export function ArquitecturaDiagram() {
  const [layerFilter, setLayerFilter] = useState<LayerFilter>('all');

  const filteredNodes = layerFilter === 'all'
    ? ARQUITECTURA_NODES
    : ARQUITECTURA_NODES.filter((n) => n.data.layer === layerFilter);

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = layerFilter === 'all'
    ? ARQUITECTURA_EDGES
    : ARQUITECTURA_EDGES.filter(
        (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
      );

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs font-semibold text-muted-foreground mr-1">Filtrar capa:</span>
        {LAYER_META.map((l) => (
          <button
            key={l.id}
            onClick={() => setLayerFilter(l.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={{
              background: layerFilter === l.id ? l.color + '22' : 'transparent',
              borderColor: layerFilter === l.id ? l.color : 'transparent',
              color: layerFilter === l.id ? l.color : '#94a3b8',
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: l.color }}
            />
            {l.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {filteredNodes.length} módulos · {filteredEdges.length} conexiones
        </span>
      </div>

      {/* Canvas */}
      <div className="flex-1 rounded-xl border border-border overflow-hidden relative" style={{ minHeight: 600 }}>
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.08, maxZoom: 0.7 }}
          minZoom={0.05}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          className="bg-background"
        >
          <Background color="#334155" gap={24} size={1} />
          <Controls
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
          />
          <MiniMap
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, height: 120, width: 180 }}
            nodeColor={(n) => {
              const layer = (n.data as ModuleNodeData)?.layer;
              const colors = { db: '#3b82f6', api: '#f97316', frontend: '#10b981', external: '#a855f7' };
              return colors[layer as keyof typeof colors] ?? '#64748b';
            }}
            maskColor="rgba(0,0,0,0.5)"
          />
        </ReactFlow>

        {/* Leyenda */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-xl p-3 space-y-1.5 shadow-lg">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Leyenda</p>
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <svg width="32" height="8" viewBox="0 0 32 8">
                <line x1="0" y1="4" x2="32" y2="4" stroke={item.color} strokeWidth="2" strokeDasharray={item.label.includes('→') && !item.label.includes('DB') && !item.label.includes('API →') ? '4 2' : undefined} />
                <polygon points="28,1 32,4 28,7" fill={item.color} />
              </svg>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Stats badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {[
            { label: '8 módulos DB',       color: '#3b82f6', count: 8 },
            { label: '8 grupos API',        color: '#f97316', count: 8 },
            { label: '10 módulos frontend', color: '#10b981', count: 10 },
            { label: '4 integraciones ext.', color: '#a855f7', count: 4 },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-lg"
              style={{ background: s.color + '22', color: s.color, border: `1px solid ${s.color}44` }}
            >
              <span className="font-bold">{s.count}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
