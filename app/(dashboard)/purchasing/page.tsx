'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/ui/data-table';
import { useDtesProveedor, useOrdenesCompra, useProveedores, acusarDte } from '@/lib/data/compras';
import { NuevoProveedorDialog, NuevaOCDialog, RegistrarDteProveedorDialog } from '@/components/purchasing/ComprasDialogs';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate, daysUntil } from '@/lib/utils/dates';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertOctagon, Flag, Clock, Plus, FileInput } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { DteProveedor, EstadoOC } from '@/types';

const DIAS_LIMITE = 8;

const OC_CONFIG: Record<EstadoOC, { label: string; variant: 'muted' | 'warning' | 'success' | 'default' }> = {
  borrador: { label: 'Borrador', variant: 'muted' },
  aprobada: { label: 'Aprobada', variant: 'default' },
  recibida: { label: 'Recibida', variant: 'success' },
  facturada: { label: 'Facturada', variant: 'success' },
};

function AcuseCard({ dte }: { dte: DteProveedor }) {
  const diasRestantes = daysUntil(dte.fechaLimiteAcuse);
  const progreso = Math.max(0, Math.min(100, ((DIAS_LIMITE - Math.max(0, diasRestantes)) / DIAS_LIMITE) * 100));
  const esCritico = diasRestantes <= 1;
  const esWarning = diasRestantes <= 2 && diasRestantes > 1;
  const esPendiente = dte.estado === 'pendiente_acuse';

  return (
    <Card className={cn(esCritico && esPendiente ? 'border-destructive/40' : esWarning && esPendiente ? 'border-warning/40' : '')}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{dte.proveedorNombre}</p>
            <p className="text-xs text-muted-foreground">Folio #{dte.folio} · Emitido {formatDate(dte.fechaEmision)}</p>
          </div>
          <span className="flex-shrink-0 text-base font-bold">{formatCLP(dte.total)}</span>
        </div>

        {esPendiente ? (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Plazo para acusar</span>
                <span className={cn('font-medium', esCritico ? 'text-destructive' : esWarning ? 'text-warning' : 'text-foreground')}>
                  {diasRestantes <= 0 ? '⚠ Vence hoy' : `${diasRestantes} días restantes`}
                </span>
              </div>
              <Progress value={progreso} className={cn('h-2', esCritico ? '[&>div]:bg-destructive' : esWarning ? '[&>div]:bg-warning' : '')} />
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" /><span>Límite: {formatDate(dte.fechaLimiteAcuse)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-7 flex-1 bg-success/90 text-xs text-white hover:bg-success" onClick={() => acusarDte(dte.id, 'aceptado')}>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />Aceptar
              </Button>
              <Button variant="outline" size="sm" className="h-7 flex-1 text-xs" onClick={() => acusarDte(dte.id, 'aceptado_con_reserva')}>
                <AlertOctagon className="mr-1 h-3.5 w-3.5" />Con Reserva
              </Button>
              <Button variant="outline" size="sm" className="h-7 flex-1 text-xs" onClick={() => acusarDte(dte.id, 'reclamado')}>
                <Flag className="mr-1 h-3.5 w-3.5" />Reclamar
              </Button>
            </div>
          </>
        ) : (
          <Badge variant={dte.estado === 'aceptado' ? 'success' : dte.estado === 'aceptado_con_reserva' ? 'warning' : 'muted'}>
            {dte.estado === 'aceptado' ? 'Aceptado' : dte.estado === 'aceptado_con_reserva' ? 'Aceptado con Reserva' : 'Reclamado'}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function PurchasingPage() {
  const router = useRouter();
  const dtesProveedor = useDtesProveedor();
  const ordenes = useOrdenesCompra();
  const proveedores = useProveedores();
  const [provOpen, setProvOpen] = useState(false);
  const [ocOpen, setOcOpen] = useState(false);
  const [dteOpen, setDteOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Compras</h1>
          <p className="text-sm text-muted-foreground">Proveedores, órdenes de compra y acuse de DTE</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setProvOpen(true)}><Plus className="mr-1 h-3.5 w-3.5" />Proveedor</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDteOpen(true)}><FileInput className="mr-1 h-3.5 w-3.5" />Registrar DTE</Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => setOcOpen(true)}><Plus className="mr-1 h-3.5 w-3.5" />Nueva OC</Button>
        </div>
      </div>

      <NuevoProveedorDialog open={provOpen} onOpenChange={setProvOpen} />
      <NuevaOCDialog open={ocOpen} onOpenChange={setOcOpen} />
      <RegistrarDteProveedorDialog open={dteOpen} onOpenChange={setDteOpen} />

      {/* DTE proveedor con acuse */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">DTE de Proveedores — Acuse 8 días</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success" />OK
            <span className="ml-2 h-2 w-2 rounded-full bg-warning" />48h
            <span className="ml-2 h-2 w-2 rounded-full bg-destructive" />Crítico
          </div>
        </div>
        {dtesProveedor.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Sin DTE de proveedores. Usa <span className="font-medium text-foreground">Registrar DTE</span> para cargar uno recibido.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {dtesProveedor.map((dp) => <AcuseCard key={dp.id} dte={dp} />)}
          </div>
        )}
      </div>

      {/* Órdenes de compra */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Órdenes de Compra</h2>
        {ordenes.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Aún no hay órdenes de compra. Crea una con <span className="font-medium text-foreground">Nueva OC</span>.
          </div>
        ) : (
          <DataTable
            data={ordenes}
            getRowId={(r) => r.id}
            searchPlaceholder="Buscar OC..."
            columns={[
              { key: 'numero', header: 'N° OC', render: (v) => <span className="font-mono text-xs font-medium">{String(v)}</span> },
              { key: 'proveedorNombre', header: 'Proveedor', sortable: true },
              { key: 'fechaEmision', header: 'Fecha', sortable: true, render: (v) => formatDate(v as Date) },
              { key: 'total', header: 'Total', align: 'right', sortable: true, render: (v) => <span className="font-medium">{formatCLP(v as number)}</span> },
              { key: 'estado', header: 'Estado', render: (v) => { const c = OC_CONFIG[v as EstadoOC]; return <Badge variant={c.variant}>{c.label}</Badge>; } },
            ]}
          />
        )}
      </div>

      {/* Proveedores */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Proveedores ({proveedores.length})</h2>
        {proveedores.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Aún no hay proveedores. Crea el primero con <span className="font-medium text-foreground">Proveedor</span>.
          </div>
        ) : (
          <DataTable
            data={proveedores}
            getRowId={(r) => r.id}
            searchPlaceholder="Buscar proveedor..."
            onRowClick={(row) => router.push(`/purchasing/proveedor/${row.id}`)}
            columns={[
              { key: 'razonSocial', header: 'Razón social', sortable: true },
              { key: 'rut', header: 'RUT', render: (v) => <span className="font-mono text-xs">{v ? String(v) : '—'}</span> },
              { key: 'giro', header: 'Giro', render: (v) => v ? String(v) : '—' },
              { key: 'contactoNombre', header: 'Contacto', render: (v) => v ? String(v) : '—' },
              { key: 'condicionPago', header: 'Pago', render: (v) => v ? String(v) : '—' },
            ]}
          />
        )}
      </div>
    </div>
  );
}
