'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockOportunidades } from '@/lib/mock/oportunidades';
import { formatCLP } from '@/lib/utils/clp';
import { daysDiff } from '@/lib/utils/dates';
import type { Oportunidad, EtapaPipeline } from '@/types';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragOverlay, type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, LayoutList, Kanban, GripVertical, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ETAPAS: { id: EtapaPipeline; label: string; color: string }[] = [
  { id: 'prospeccion', label: 'Prospección', color: 'bg-indigo-500' },
  { id: 'calificado', label: 'Calificado', color: 'bg-amber-500' },
  { id: 'cotizacion_enviada', label: 'Cotización Enviada', color: 'bg-blue-500' },
  { id: 'negociacion', label: 'Negociación', color: 'bg-violet-500' },
  { id: 'ganada', label: 'Ganada', color: 'bg-emerald-500' },
  { id: 'perdida', label: 'Perdida', color: 'bg-red-500' },
];

const ROTTING_WARN = 14;
const ROTTING_CRIT = 21;

function getRottingVariant(op: Oportunidad): 'ok' | 'warn' | 'crit' {
  if (op.etapa === 'ganada' || op.etapa === 'perdida') return 'ok';
  const days = daysDiff(op.ultimaActividad);
  if (days >= ROTTING_CRIT) return 'crit';
  if (days >= ROTTING_WARN) return 'warn';
  return 'ok';
}

function DealCard({ op, overlay = false }: { op: Oportunidad; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: op.id });
  const rotting = getRottingVariant(op);
  const dias = daysDiff(op.ultimaActividad);

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-card p-3 space-y-2 transition-shadow',
        isDragging && 'opacity-40',
        overlay && 'shadow-2xl rotate-1',
        rotting === 'warn' && 'border-warning/50',
        rotting === 'crit' && 'border-destructive/50 bg-destructive/5',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium leading-snug flex-1 min-w-0">{op.titulo}</p>
        <button {...attributes} {...listeners} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground truncate">{op.clienteNombre}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-primary">{formatCLP(op.monto)}</span>
        <Badge variant={op.probabilidad >= 70 ? 'success' : op.probabilidad >= 40 ? 'warning' : 'muted'} className="text-[10px]">
          {op.probabilidad}%
        </Badge>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><User className="h-3 w-3" />{op.vendedorNombre.split(' ')[0]}</span>
        <span className={cn('flex items-center gap-1', rotting === 'crit' && 'text-destructive font-medium', rotting === 'warn' && 'text-warning font-medium')}>
          <Clock className="h-3 w-3" />
          {dias === 0 ? 'Hoy' : `${dias}d sin actividad`}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ etapa, ops }: { etapa: typeof ETAPAS[number]; ops: Oportunidad[] }) {
  const total = ops.reduce((s, o) => s + o.monto, 0);
  return (
    <div className="flex flex-col w-64 flex-shrink-0">
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${etapa.color}`} />
        <span className="text-xs font-semibold">{etapa.label}</span>
        <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{ops.length}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">{formatCLP(total)}</div>
      <SortableContext items={ops.map(o => o.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[120px] rounded-lg border border-dashed border-border p-2">
          {ops.map(op => <DealCard key={op.id} op={op} />)}
        </div>
      </SortableContext>
    </div>
  );
}

export default function CrmPage() {
  const pathname = usePathname();
  const [ops, setOps] = useState<Oportunidad[]>(mockOportunidades);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'lista'>('kanban');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const activeOp = ops.find(o => o.id === activeId);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) { setActiveId(null); return; }
    const sourceOp = ops.find(o => o.id === active.id);
    const targetOp = ops.find(o => o.id === over.id);
    if (!sourceOp || !targetOp) { setActiveId(null); return; }
    if (sourceOp.etapa !== targetOp.etapa) {
      setOps(prev => prev.map(o => o.id === active.id ? { ...o, etapa: targetOp.etapa, ultimaActividad: new Date() } : o));
    }
    setActiveId(null);
  }

  const totalPipeline = ops.filter(o => o.etapa !== 'perdida').reduce((s, o) => s + o.monto, 0);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold">CRM / Pipeline</h1>
          <p className="text-sm text-muted-foreground">Pipeline activo: <span className="font-semibold text-foreground">{formatCLP(totalPipeline)}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            <button onClick={() => setView('kanban')} className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors', view === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <Kanban className="h-3.5 w-3.5" />Kanban
            </button>
            <button onClick={() => setView('lista')} className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border-l', view === 'lista' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <LayoutList className="h-3.5 w-3.5" />Lista
            </button>
          </div>
          <Button size="sm" className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Nueva oportunidad</Button>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex items-center gap-1 border-b flex-shrink-0">
        {[
          { label: 'Pipeline', href: '/crm' },
          { label: 'Leads', href: '/crm/leads' },
          { label: 'Contactos', href: '/crm/contactos' },
          { label: 'Empresas', href: '/crm/empresas' },
        ].map(item => {
          const isActive = item.href === '/crm' ? pathname === '/crm' : pathname.startsWith(item.href);
          return (
          <Link key={item.href} href={item.href} className={cn('px-3 py-2 text-xs font-medium border-b-2 transition-colors', isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {item.label}
          </Link>
        );})}
      </div>

      {view === 'kanban' ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
            {ETAPAS.map(etapa => (
              <KanbanColumn key={etapa.id} etapa={etapa} ops={ops.filter(o => o.etapa === etapa.id)} />
            ))}
          </div>
          <DragOverlay>
            {activeOp && <DealCard op={activeOp} overlay />}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex-1">
          <Link href="/crm/lista"><Button variant="outline" size="sm" className="text-xs">Ver vista lista completa</Button></Link>
        </div>
      )}
    </div>
  );
}
