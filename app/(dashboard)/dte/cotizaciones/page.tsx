'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VentasNav } from '@/components/dte/VentasNav';
import {
  useCotizaciones,
  useAprobarCotizacion,
  useRechazarCotizacion,
  useConvertirAOV,
} from '@/lib/data/ventas';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { EstadoCotizacion } from '@/types';

const ESTADO_CONFIG: Record<EstadoCotizacion, { label: string; variant: 'success' | 'destructive' | 'warning' | 'muted' | 'default' }> = {
  borrador: { label: 'Borrador', variant: 'muted' },
  enviada: { label: 'Enviada', variant: 'warning' },
  aprobada: { label: 'Aprobada', variant: 'success' },
  rechazada: { label: 'Rechazada', variant: 'destructive' },
  convertida: { label: 'Convertida a OV', variant: 'default' },
};

export default function CotizacionesPage() {
  const cotizaciones = useCotizaciones();
  const router = useRouter();
  const aprobar = useAprobarCotizacion();
  const rechazar = useRechazarCotizacion();
  const convertir = useConvertirAOV();

  async function handleConvertir(id: string) {
    try {
      const ov = await convertir.mutateAsync(id);
      toast.success(`Orden de Venta ${ov.numero} generada`);
      router.push('/dte/ordenes');
    } catch {
      toast.error('Error al convertir la cotización');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground">{cotizaciones.length} cotizaciones</p>
        </div>
        <Button size="sm" className="h-8 text-xs" asChild>
          <Link href="/dte/nueva"><Plus className="mr-1 h-3.5 w-3.5" />Nueva cotización</Link>
        </Button>
      </div>

      <VentasNav />

      {cotizaciones.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Aún no hay cotizaciones. Crea la primera con <span className="font-medium text-foreground">Nueva cotización</span>.
        </div>
      ) : (
        <DataTable
          data={cotizaciones}
          getRowId={(r) => r.id}
          searchPlaceholder="Buscar cotizaciones..."
          exportable
          columns={[
            { key: 'numero', header: 'N° Cotización', render: (v) => <span className="font-mono text-xs font-medium">{String(v)}</span> },
            { key: 'clienteNombre', header: 'Cliente', sortable: true },
            { key: 'clienteRut', header: 'RUT', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
            { key: 'fechaEmision', header: 'Fecha', sortable: true, render: (v) => formatDate(v as Date) },
            { key: 'total', header: 'Total', align: 'right', sortable: true, render: (v) => <span className="font-medium">{formatCLP(v as number)}</span> },
            { key: 'vendedorNombre', header: 'Vendedor', render: (v) => v ? String(v) : '—' },
            { key: 'estado', header: 'Estado', render: (v) => { const c = ESTADO_CONFIG[v as EstadoCotizacion]; return <Badge variant={c.variant}>{c.label}</Badge>; } },
          ]}
          actions={(row) => (
            <>
              {(row.estado === 'borrador' || row.estado === 'enviada') && (
                <>
                  <DropdownMenuItem className="text-xs" asChild>
                    <Link href={`/dte/cotizaciones/${row.id}/editar`}>Editar</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs" onClick={() => {
                    aprobar.mutate(row.id, { onSuccess: () => toast.success('Cotización aprobada') });
                  }}>Aprobar</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs text-destructive" onClick={() => {
                    rechazar.mutate(row.id, { onSuccess: () => toast('Cotización rechazada') });
                  }}>Rechazar</DropdownMenuItem>
                </>
              )}
              {row.estado === 'aprobada' && (
                <DropdownMenuItem className="text-xs" onClick={() => handleConvertir(row.id)}>
                  Convertir a Orden de Venta
                </DropdownMenuItem>
              )}
              {row.estado === 'convertida' && (
                <DropdownMenuItem className="text-xs" asChild>
                  <Link href="/dte/ordenes">Ver Orden de Venta</Link>
                </DropdownMenuItem>
              )}
            </>
          )}
        />
      )}
    </div>
  );
}
