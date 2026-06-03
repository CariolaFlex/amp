'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { useMovimientos } from '@/lib/data/inventory';
import { formatDate } from '@/lib/utils/dates';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const TIPO_CONFIG = {
  entrada: { label: 'Entrada', variant: 'success' as const },
  salida: { label: 'Salida', variant: 'destructive' as const },
  ajuste: { label: 'Ajuste', variant: 'warning' as const },
  transferencia: { label: 'Transferencia', variant: 'secondary' as const },
};

export default function MovimientosPage() {
  const movimientos = useMovimientos();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/inventory"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Movimientos de Stock</h1>
          <p className="text-sm text-muted-foreground">Historial de entradas, salidas y ajustes</p>
        </div>
      </div>
      <DataTable
        data={movimientos}
        getRowId={(r) => r.id}
        searchPlaceholder="Buscar movimientos..."
        exportable
        emptyMessage="Sin movimientos de stock todavía."
        columns={[
          { key: 'fecha', header: 'Fecha', sortable: true, render: (v) => formatDate(v as Date) },
          { key: 'productoNombre', header: 'Producto', sortable: true },
          { key: 'tipo', header: 'Tipo', render: (v) => { const cfg = TIPO_CONFIG[v as keyof typeof TIPO_CONFIG]; return <Badge variant={cfg.variant}>{cfg.label}</Badge>; } },
          { key: 'cantidad', header: 'Cantidad', align: 'right', render: (v) => <span className={(v as number) < 0 ? 'text-destructive font-medium' : 'font-medium'}>{(v as number) > 0 ? '+' : ''}{String(v)}</span> },
          { key: 'motivo', header: 'Motivo', render: (v) => v ? String(v) : '—' },
          { key: 'usuario', header: 'Usuario' },
        ]}
      />
    </div>
  );
}
