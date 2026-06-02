'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDtes } from '@/lib/mock/dtes';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import type { EstadoDte, TipoDte } from '@/types';
import { Plus, FileText } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const TIPO_LABEL: Record<TipoDte, string> = {
  33: 'Factura Afecta',
  34: 'Factura Exenta',
  39: 'Boleta',
  52: 'Guía Despacho',
  56: 'Nota Débito',
  61: 'Nota Crédito',
};

const ESTADO_CONFIG: Record<EstadoDte, { label: string; variant: 'success' | 'destructive' | 'warning' | 'muted' | 'default' }> = {
  aceptado: { label: 'Aceptado', variant: 'success' },
  pagado: { label: 'Pagado', variant: 'success' },
  pendiente: { label: 'Pendiente', variant: 'warning' },
  enviado_sii: { label: 'Enviado SII', variant: 'warning' },
  rechazado: { label: 'Rechazado', variant: 'destructive' },
  anulado: { label: 'Anulado', variant: 'muted' },
  borrador: { label: 'Borrador', variant: 'muted' },
};

export default function DtePage() {
  const [filter, setFilter] = useState<'todos' | EstadoDte>('todos');

  const filteredDtes = filter === 'todos' ? mockDtes : mockDtes.filter(d => d.estado === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Cotizaciones y DTE</h1>
          <p className="text-sm text-muted-foreground">Documentos tributarios electrónicos emitidos</p>
        </div>
        <Button size="sm" className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Nueva cotización</Button>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['aceptado', 'pendiente', 'rechazado', 'pagado'] as EstadoDte[]).map(estado => {
          const count = mockDtes.filter(d => d.estado === estado).length;
          const cfg = ESTADO_CONFIG[estado];
          return (
            <button key={estado} onClick={() => setFilter(estado)} className={`rounded-lg border p-3 text-left transition-colors hover:bg-muted ${filter === estado ? 'bg-muted border-primary' : ''}`}>
              <p className="text-2xl font-bold">{count}</p>
              <div className="mt-1"><Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge></div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Button variant={filter === 'todos' ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setFilter('todos')}>Todos</Button>
        {(['aceptado', 'pendiente', 'rechazado', 'pagado', 'anulado'] as EstadoDte[]).map(e => (
          <Button key={e} variant={filter === e ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setFilter(e)}>
            {ESTADO_CONFIG[e].label}
          </Button>
        ))}
      </div>

      <DataTable
        data={filteredDtes}
        getRowId={(r) => r.id}
        searchPlaceholder="Buscar por cliente, folio..."
        exportable
        columns={[
          { key: 'folio', header: 'Folio', sortable: true, width: '80px', render: (v) => <span className="font-mono font-medium">#{String(v)}</span> },
          { key: 'tipo', header: 'Tipo', render: (v) => <span className="text-xs">{TIPO_LABEL[v as TipoDte]}</span> },
          { key: 'clienteNombre', header: 'Cliente', sortable: true },
          { key: 'clienteRut', header: 'RUT', render: (v) => <span className="text-xs font-mono">{String(v)}</span> },
          { key: 'fechaEmision', header: 'Emisión', sortable: true, render: (v) => formatDate(v as Date) },
          { key: 'total', header: 'Total', align: 'right', sortable: true, render: (v) => <span className="font-medium">{formatCLP(v as number)}</span> },
          {
            key: 'estado',
            header: 'Estado',
            render: (v) => {
              const cfg = ESTADO_CONFIG[v as EstadoDte];
              return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
            },
          },
        ]}
        actions={(row) => (
          <>
            <DropdownMenuItem className="text-xs"><FileText className="h-3.5 w-3.5 mr-2" />Ver PDF</DropdownMenuItem>
            {row.estado === 'aceptado' && (
              <DropdownMenuItem className="text-xs">Emitir Nota de Crédito</DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-xs">Ver detalle</DropdownMenuItem>
          </>
        )}
      />
    </div>
  );
}
