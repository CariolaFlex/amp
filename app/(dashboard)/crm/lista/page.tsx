'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOportunidades } from '@/lib/data/crm';
import { useClientes } from '@/lib/data/clientes';
import { NuevaOportunidadDialog } from '@/components/crm/NuevaOportunidadDialog';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate, daysDiff } from '@/lib/utils/dates';
import type { EtapaPipeline } from '@/types';
import { Plus, ArrowLeft, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const ETAPA_CONFIG: Record<EtapaPipeline, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default' | 'muted' | 'secondary' }> = {
  prospeccion:        { label: 'Prospección',       variant: 'muted' },
  calificado:         { label: 'Calificado',         variant: 'warning' },
  cotizacion_enviada: { label: 'Cotización Enviada', variant: 'default' },
  negociacion:        { label: 'Negociación',        variant: 'secondary' },
  ganada:             { label: 'Ganada',             variant: 'success' },
  perdida:            { label: 'Perdida',            variant: 'destructive' },
};

export default function CrmListaPage() {
  const oportunidades = useOportunidades();
  const clientes = useClientes();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const clientePorRut = (rut: string) => clientes.find((c) => c.rut === rut);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/crm"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Pipeline — Vista Lista</h1>
          <p className="text-sm text-muted-foreground">{oportunidades.length} oportunidades</p>
        </div>
        <Button size="sm" className="h-8 text-xs" onClick={() => setDialogOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />Nueva oportunidad</Button>
      </div>

      <NuevaOportunidadDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <DataTable
        data={oportunidades}
        getRowId={r => r.id}
        searchPlaceholder="Buscar oportunidades..."
        exportable
        onRowClick={(row) => router.push(`/crm/oportunidad/${row.id}`)}
        columns={[
          { key: 'titulo',         header: 'Oportunidad', sortable: true },
          { key: 'clienteNombre',  header: 'Cliente',     sortable: true },
          { key: 'clienteRut',     header: 'RUT',         render: v => <span className="font-mono text-xs">{String(v)}</span> },
          { key: 'monto',          header: 'Monto',       align: 'right', sortable: true, render: v => <span className="font-medium">{formatCLP(v as number)}</span> },
          { key: 'etapa',          header: 'Etapa',       render: v => { const c = ETAPA_CONFIG[v as EtapaPipeline]; return <Badge variant={c.variant}>{c.label}</Badge>; } },
          { key: 'probabilidad',   header: 'Prob.',       align: 'right', render: v => <span>{String(v)}%</span> },
          { key: 'vendedorNombre', header: 'Vendedor',    sortable: true },
          { key: 'ultimaActividad',header: 'Últ. actividad', sortable: true, render: (v, row) => {
            const dias = daysDiff(v as Date);
            return (
              <span className={dias >= 21 ? 'text-destructive font-medium' : dias >= 14 ? 'text-warning font-medium' : ''}>
                {dias === 0 ? 'Hoy' : `hace ${dias}d`}
              </span>
            );
          }},
          { key: 'createdAt',      header: 'Creado', sortable: true, render: v => formatDate(v as Date) },
        ]}
        actions={(row) => {
          const cli = clientePorRut(row.clienteRut);
          return (
            <>
              <DropdownMenuItem className="text-xs" onClick={() => router.push(`/dte/nueva?clienteRut=${encodeURIComponent(row.clienteRut)}`)}>
                <FileText className="mr-2 h-3.5 w-3.5" />Crear cotización
              </DropdownMenuItem>
              {cli && (
                <DropdownMenuItem className="text-xs" onClick={() => router.push(`/crm/clientes/${cli.id}`)}>
                  <User className="mr-2 h-3.5 w-3.5" />Ver cliente
                </DropdownMenuItem>
              )}
            </>
          );
        }}
        rowClassName={row => row.etapa === 'perdida' ? 'opacity-60' : undefined}
      />
    </div>
  );
}
