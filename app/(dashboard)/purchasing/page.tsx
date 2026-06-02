'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockDtesProveedor } from '@/lib/mock/dtes';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate, daysUntil } from '@/lib/utils/dates';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertOctagon, Flag, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

const DIAS_LIMITE = 8;

function AcuseCard({ dte }: { dp: boolean; dte: typeof mockDtesProveedor[number] }) {
  const diasRestantes = daysUntil(dte.fechaLimiteAcuse);
  const progreso = Math.max(0, Math.min(100, ((DIAS_LIMITE - Math.max(0, diasRestantes)) / DIAS_LIMITE) * 100));
  const esCritico = diasRestantes <= 1;
  const esWarning = diasRestantes <= 2 && diasRestantes > 1;
  const esPendiente = dte.estado === 'pendiente_acuse';

  return (
    <Card className={cn(esCritico && esPendiente ? 'border-destructive/40' : esWarning && esPendiente ? 'border-warning/40' : '')}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{dte.proveedorNombre}</p>
            <p className="text-xs text-muted-foreground">Folio #{dte.folio} · Emitido {formatDate(dte.fechaEmision)}</p>
          </div>
          <span className="text-base font-bold flex-shrink-0">{formatCLP(dte.total)}</span>
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
              <Progress
                value={progreso}
                className={cn('h-2', esCritico ? '[&>div]:bg-destructive' : esWarning ? '[&>div]:bg-warning' : '')}
              />
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Límite: {formatDate(dte.fechaLimiteAcuse)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-7 text-xs flex-1 bg-success/90 hover:bg-success text-white">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Aceptar
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                <AlertOctagon className="h-3.5 w-3.5 mr-1" />Con Reserva
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                <Flag className="h-3.5 w-3.5 mr-1" />Reclamar
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Compras</h1>
          <p className="text-sm text-muted-foreground">Órdenes de compra y acuse de DTE</p>
        </div>
        <Button size="sm" className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Nueva OC</Button>
      </div>

      {/* DTE proveedor con acuse */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">DTE de Proveedores — Acuse 8 días</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success" />OK
            <span className="h-2 w-2 rounded-full bg-warning ml-2" />48h
            <span className="h-2 w-2 rounded-full bg-destructive ml-2" />Crítico
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {mockDtesProveedor.map(dp => <AcuseCard key={dp.id} dp dte={dp} />)}
        </div>
      </div>

      {/* Toggle acuse automático */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Acuse automático</p>
            <p className="text-xs text-muted-foreground">Aceptar automáticamente en el día 7 si no hay acción manual</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">ON</span>
            <div className="h-5 w-9 rounded-full bg-primary relative cursor-pointer">
              <div className="absolute right-1 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
