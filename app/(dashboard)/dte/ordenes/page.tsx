'use client';

import React from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { VentasNav } from '@/components/dte/VentasNav';
import { useOrdenesVenta, emitirDteDesdeOV } from '@/lib/data/ventas';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { OrdenVenta, EstadoOV } from '@/types';

const ESTADO_CONFIG: Record<EstadoOV, { label: string; variant: 'success' | 'warning' | 'muted' }> = {
  pendiente: { label: 'Pendiente facturar', variant: 'warning' },
  facturada: { label: 'Facturada', variant: 'success' },
  anulada: { label: 'Anulada', variant: 'muted' },
};

export default function OrdenesVentaPage() {
  const ordenes = useOrdenesVenta();
  const router = useRouter();

  async function handleEmitir(ov: OrdenVenta) {
    const dte = await emitirDteDesdeOV(ov);
    toast.success(`DTE folio #${dte.folio} emitido`);
    router.push('/dte');
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
                <DropdownMenuItem className="text-xs" onClick={() => handleEmitir(row)}>Emitir DTE</DropdownMenuItem>
              )}
              {row.estado === 'facturada' && (
                <DropdownMenuItem className="text-xs" asChild><Link href="/dte">Ver DTE emitido</Link></DropdownMenuItem>
              )}
            </>
          )}
        />
      )}
    </div>
  );
}
