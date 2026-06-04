'use client';

import React from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { VentasNav } from '@/components/dte/VentasNav';
import { useOrdenesVenta, useEmitirDte, useAnularOV } from '@/lib/data/ventas';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { EstadoOV } from '@/types';

const ESTADO_CONFIG: Record<EstadoOV, { label: string; variant: 'success' | 'warning' | 'muted' }> = {
  pendiente: { label: 'Pendiente facturar', variant: 'warning' },
  facturada: { label: 'Facturada', variant: 'success' },
  anulada: { label: 'Anulada', variant: 'muted' },
};

export default function OrdenesVentaPage() {
  const ordenes = useOrdenesVenta();
  const router = useRouter();
  const emitir = useEmitirDte();
  const anular = useAnularOV();

  async function handleEmitir(ovId: string) {
    try {
      const dte = await emitir.mutateAsync(ovId);
      toast.success(`DTE folio #${dte.folio} emitido`);
      router.push('/dte');
    } catch {
      toast.error('Error al emitir el DTE');
    }
  }

  async function handleAnular(ovId: string, numero: string, tieneDte: boolean) {
    try {
      await anular.mutateAsync(ovId);
      const msg = tieneDte
        ? `OV ${numero} anulada — DTE anulado y stock repuesto`
        : `OV ${numero} anulada — cotización vuelve a Aprobada`;
      toast.success(msg);
    } catch {
      toast.error('Error al anular la OV');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Órdenes de Venta</h1>
        <p className="text-sm text-muted-foreground">{ordenes.length} órdenes</p>
      </div>

      <VentasNav />

      {ordenes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Aún no hay órdenes de venta. Se generan al convertir una cotización aprobada.
        </div>
      ) : (
        <DataTable
          data={ordenes}
          getRowId={(r) => r.id}
          searchPlaceholder="Buscar órdenes..."
          exportable
          columns={[
            { key: 'numero', header: 'N° OV', render: (v) => <span className="font-mono text-xs font-medium">{String(v)}</span> },
            { key: 'clienteNombre', header: 'Cliente', sortable: true },
            { key: 'clienteRut', header: 'RUT', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
            { key: 'fechaEmision', header: 'Fecha', sortable: true, render: (v) => formatDate(v as Date) },
            { key: 'total', header: 'Total', align: 'right', sortable: true, render: (v) => <span className="font-medium">{formatCLP(v as number)}</span> },
            { key: 'estado', header: 'Estado', render: (v) => { const c = ESTADO_CONFIG[v as EstadoOV]; return <Badge variant={c.variant}>{c.label}</Badge>; } },
          ]}
          actions={(row) => (
            <>
              {row.estado === 'pendiente' && (
                <DropdownMenuItem className="text-xs" onClick={() => handleEmitir(row.id)}>
                  Emitir DTE
                </DropdownMenuItem>
              )}
              {row.estado === 'facturada' && (
                <DropdownMenuItem className="text-xs" asChild>
                  <Link href="/dte">Ver DTE emitido</Link>
                </DropdownMenuItem>
              )}
              {(row.estado === 'pendiente' || row.estado === 'facturada') && (
                <DropdownMenuItem
                  className="text-xs text-destructive"
                  onClick={() => handleAnular(row.id, row.numero, !!row.dteId)}
                >
                  Anular OV
                </DropdownMenuItem>
              )}
            </>
          )}
        />
      )}
    </div>
  );
}
