'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { Upload, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const cuentasBancarias = [
  { id: 'b1', banco: 'Banco de Chile', numero: '00-123-45678-90', tipo: 'Cuenta Corriente', saldo: 28450000, ultimaConciliacion: new Date('2026-05-31') },
  { id: 'b2', banco: 'Banco Santander', numero: '67890123', tipo: 'Cuenta Vista', saldo: 4200000, ultimaConciliacion: new Date('2026-05-28') },
];

const flujoData = [
  { periodo: '1-10 Jun', entrante: 18000000, saliente: 4800000 },
  { periodo: '11-20 Jun', entrante: 8500000,  saliente: 1250000 },
  { periodo: '21-30 Jun', entrante: 0,         saliente: 6050000 },
  { periodo: '1-10 Jul', entrante: 24000000,  saliente: 2400000 },
];

const movimientosMock = [
  { fecha: new Date('2026-05-30'), descripcion: 'Abono transferencia Minera Atacama', monto: 18000000, tipo: 'abono' as const },
  { fecha: new Date('2026-05-28'), descripcion: 'Pago proveedor Acero Chile SA', monto: -4800000, tipo: 'cargo' as const },
  { fecha: new Date('2026-05-25'), descripcion: 'Abono transferencia Supermercados Norte', monto: 4200000, tipo: 'abono' as const },
  { fecha: new Date('2026-05-20'), descripcion: 'Comisión bancaria mensual', monto: -15000, tipo: 'cargo' as const },
];

export default function BancosPage() {
  const [uploadState, setUploadState] = useState<'idle' | 'procesando' | 'ok'>('idle');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/treasury"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Bancos y Conciliación</h1>
          <p className="text-sm text-muted-foreground">Saldos actuales y conciliación bancaria</p>
        </div>
      </div>

      {/* Cuentas bancarias */}
      <div className="grid gap-3 sm:grid-cols-2">
        {cuentasBancarias.map(c => (
          <Card key={c.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{c.banco}</p>
                  <p className="text-xs text-muted-foreground font-mono">{c.numero}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px]">{c.tipo}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-success">{formatCLP(c.saldo)}</p>
                  <p className="text-xs text-muted-foreground">Últ. conciliación: {formatDate(c.ultimaConciliacion)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {movimientosMock.slice(0, 3).map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate flex-1 mr-2">{m.descripcion}</span>
                    <span className={m.tipo === 'abono' ? 'text-success font-medium' : 'text-destructive font-medium'}>
                      {m.monto > 0 ? '+' : ''}{formatCLP(m.monto)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conciliación bancaria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Conciliación Bancaria — Subir Cartola</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onClick={() => { if (uploadState === 'idle') { setUploadState('procesando'); setTimeout(() => setUploadState('ok'), 1500); }}}
            className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
              uploadState === 'ok' ? 'border-success/50 bg-success/5'
              : uploadState === 'procesando' ? 'border-primary/50 bg-primary/5'
              : 'border-border hover:border-primary/40 hover:bg-muted/20'
            }`}
          >
            {uploadState === 'idle' && (
              <div className="space-y-2">
                <Upload className="h-7 w-7 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium">Subir cartola CSV del banco</p>
                <p className="text-xs text-muted-foreground">Compatible con Banco de Chile, Santander, BCI, Itaú</p>
              </div>
            )}
            {uploadState === 'procesando' && (
              <div className="space-y-2">
                <div className="animate-spin h-7 w-7 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm">Procesando cartola...</p>
              </div>
            )}
            {uploadState === 'ok' && (
              <div className="space-y-2">
                <CheckCircle2 className="h-7 w-7 text-success mx-auto" />
                <p className="text-sm font-medium text-success">12 movimientos conciliados automáticamente</p>
                <p className="text-xs text-muted-foreground">2 diferencias pendientes de revisión</p>
              </div>
            )}
          </div>

          {uploadState === 'ok' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Diferencias pendientes</p>
              {[
                { desc: 'Cargo no identificado $45.000', tipo: 'warning' as const },
                { desc: 'Abono sin coincidencia en libro $890.000', tipo: 'warning' as const },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />
                  <span className="text-xs flex-1">{d.desc}</span>
                  <Button variant="outline" size="sm" className="h-6 text-[10px]">Revisar</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flujo de caja proyectado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Flujo de Caja Proyectado — Próximos 30 días</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={flujoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="periodo" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: unknown) => formatCLP(v as number)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="entrante" name="CxC esperada" fill="hsl(var(--success))" radius={[4,4,0,0]} opacity={0.8} />
              <Bar dataKey="saliente" name="CxP programada" fill="hsl(var(--destructive))" radius={[4,4,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
