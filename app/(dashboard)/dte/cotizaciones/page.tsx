'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const mockCotizaciones = [
  { id: 'c-001', numero: 'COT-2026-015', clienteNombre: 'Minera Atacama SA', clienteRut: '78.456.789-0', fecha: new Date('2026-05-28'), total: 45000000, estado: 'enviada', vendedor: 'María González' },
  { id: 'c-002', numero: 'COT-2026-016', clienteNombre: 'Supermercados Norte SA', clienteRut: '79.321.654-3', fecha: new Date('2026-05-25'), total: 120000000, estado: 'borrador', vendedor: 'Pablo Reyes' },
  { id: 'c-003', numero: 'COT-2026-014', clienteNombre: 'Hotelería Andina Ltda', clienteRut: '76.543.210-K', fecha: new Date('2026-05-20'), total: 67000000, estado: 'aprobada', vendedor: 'Pablo Reyes' },
  { id: 'c-004', numero: 'COT-2026-013', clienteNombre: 'Pesquera del Pacífico Ltda', clienteRut: '77.654.321-8', fecha: new Date('2026-05-15'), total: 18000000, estado: 'vencida', vendedor: 'Andrea Molina' },
];

const ESTADO_CONFIG = {
  borrador:  { label: 'Borrador',  variant: 'muted' as const },
  enviada:   { label: 'Enviada',   variant: 'warning' as const },
  aprobada:  { label: 'Aprobada', variant: 'success' as const },
  rechazada: { label: 'Rechazada',variant: 'destructive' as const },
  vencida:   { label: 'Vencida',  variant: 'destructive' as const },
};

export default function CotizacionesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground">{mockCotizaciones.length} cotizaciones</p>
        </div>
        <Button size="sm" className="h-8 text-xs" asChild>
          <Link href="/dte/nueva"><Plus className="h-3.5 w-3.5 mr-1" />Nueva cotización</Link>
        </Button>
      </div>

      <DataTable
        data={mockCotizaciones}
        getRowId={r => r.id}
        searchPlaceholder="Buscar cotizaciones..."
        exportable
        columns={[
          { key: 'numero',       header: 'N° Cotización', render: v => <span className="font-mono text-xs font-medium">{String(v)}</span> },
          { key: 'clienteNombre',header: 'Cliente',       sortable: true },
          { key: 'clienteRut',   header: 'RUT',           render: v => <span className="font-mono text-xs">{String(v)}</span> },
          { key: 'fecha',        header: 'Fecha',         sortable: true, render: v => formatDate(v as Date) },
          { key: 'total',        header: 'Total',         align: 'right', sortable: true, render: v => <span className="font-medium">{formatCLP(v as number)}</span> },
          { key: 'vendedor',     header: 'Vendedor' },
          { key: 'estado',       header: 'Estado', render: v => {
            const cfg = ESTADO_CONFIG[v as keyof typeof ESTADO_CONFIG];
            return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
          }},
        ]}
        actions={row => (
          <>
            <DropdownMenuItem className="text-xs">Ver cotización</DropdownMenuItem>
            {row.estado === 'aprobada' && (
              <DropdownMenuItem className="text-xs">Convertir a DTE</DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-xs">Duplicar</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-destructive">Anular</DropdownMenuItem>
          </>
        )}
      />
    </div>
  );
}
