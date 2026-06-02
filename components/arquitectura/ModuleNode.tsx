'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { LAYER_COLORS, type ModuleNodeData } from '@/lib/arquitectura/data';

export type ModuleNodeType = Node<ModuleNodeData, 'moduleNode'>;

const LAYER_LABELS: Record<ModuleNodeData['layer'], string> = {
  db: 'SQL Server',
  api: 'Next.js API',
  frontend: 'Frontend',
  external: 'Externo',
};

const MODULE_ICONS: Record<string, string> = {
  SISTEMA: '🔐',
  CRM: '👥',
  VENTAS: '📄',
  INVENTARIO: '📦',
  COMPRAS: '🛒',
  CONTABILIDAD: '📚',
  'TESORERÍA': '💰',
  RRHH: '👤',
  DASHBOARD: '📊',
  AUTH: '🔑',
  EXTERNO: '🌐',
};

export const ModuleNode = memo(function ModuleNode({ data }: NodeProps<ModuleNodeType>) {
  const colors = LAYER_COLORS[data.layer];
  const icon = MODULE_ICONS[data.module] ?? '⚙️';

  return (
    <div
      className={cn(
        'rounded-xl border-2 shadow-xl min-w-[300px] max-w-[320px] backdrop-blur-sm overflow-hidden',
        colors.bg,
        colors.border,
      )}
      style={{ fontSize: 11 }}
    >
      <Handle type="target" position={Position.Left} style={{ width: 8, height: 8, background: '#64748b', border: '2px solid #334155' }} />
      <Handle type="source" position={Position.Right} style={{ width: 8, height: 8, background: '#64748b', border: '2px solid #334155' }} />
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8, background: '#64748b', border: '2px solid #334155' }} />
      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: '#64748b', border: '2px solid #334155' }} />

      {/* Header */}
      <div className={cn('flex items-center justify-between px-3 py-2.5 gap-2', colors.header)}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none flex-shrink-0">{icon}</span>
          <span className={cn('font-bold text-xs leading-snug truncate', colors.text)}>{data.label}</span>
        </div>
        <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0', colors.badge)}>
          {LAYER_LABELS[data.layer]}
        </span>
      </div>

      {/* Description */}
      {data.description && (
        <div className="px-3 py-1.5 border-b border-white/10">
          <p className="text-[10px] text-white/60 leading-snug">{data.description}</p>
        </div>
      )}

      {/* Items */}
      <div className="px-3 py-2 space-y-0.5">
        {data.items.map((item, i) => {
          const isIndented = item.startsWith('  →') || item.startsWith('  ');
          const isPending = item.includes('[PENDIENTE]');
          const isDone = item.includes('✅');

          return (
            <div
              key={i}
              className={cn(
                'flex items-start gap-1.5 leading-snug',
                isIndented && 'pl-3 opacity-70',
                isPending && 'opacity-40',
              )}
            >
              {!isIndented && (
                <span className="mt-0.5 flex-shrink-0">
                  {isPending
                    ? <span className="text-[8px] text-yellow-400">○</span>
                    : isDone
                      ? <span className="text-[8px] text-emerald-400">●</span>
                      : <span className="text-[8px] text-white/40">·</span>
                  }
                </span>
              )}
              <span className={cn(
                'font-mono text-[10px] break-all',
                colors.text,
                isPending ? 'text-yellow-300/60' : isDone ? 'text-emerald-300' : '',
              )}>
                {item.replace('[PENDIENTE] ', '').replace(' ✅', '')}
                {isDone && <span className="ml-1 text-emerald-400 non-mono"> ✅</span>}
                {isPending && <span className="ml-1 text-yellow-500/70"> ○</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
