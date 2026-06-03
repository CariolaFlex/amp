'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { Plus, ArrowLeft, Landmark } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCuentasBancarias, useMovimientosBancarios } from '@/lib/data/bancos';
import { useCuentasCobrar, useCuentasPagar } from '@/lib/data/tesoreria';
import { NuevaCuentaBancariaDialog, RegistrarMovimientoBancarioDialog } from '@/components/treasury/BancosDialogs';
import type { MovimientoBancario } from '@/types';

export default function BancosPage() {
  const cuentas = useCuentasBancarias();
  const movimientos = useMovimientosBancarios();
  const cxc = useCuentasCobrar();
  const cxp = useCuentasPagar();
  const [cuentaOpen, setCuentaOpen] = useState(false);
  const [movOpen, setMovOpen] = useState(false);

  const saldoTotal = cuentas.reduce((s, c) => s + c.saldo, 0);
  const movPorCuenta = useMemo(() => {
    const map: Record<string, MovimientoBancario[]> = {};
    movimientos.forEach((m) => { (map[m.cuentaId] ??= []).push(m); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
    return map;
  }, [movimientos]);

  // Flujo de caja proyectado: CxC (entrante) y CxP (saliente) por semana, próximos 30 días
  const flujoData = useMemo(() => {
    const hoy = new Date();
    const buckets = [0, 1, 2, 3].map((i) => ({
      periodo: `Sem ${i + 1}`,
      desde: new Date(hoy.getTime() + i * 7 * 86400000),
      hasta: new Date(hoy.getTime() + (i + 1) * 7 * 86400000),
      entrante: 0,
      saliente: 0,
    }));
    cxc.forEach((c) => { const v = new Date(c.fechaVencimiento).getTime(); const b = buckets.find((x) => v >= x.desde.getTime() && v < x.hasta.getTime()); if (b) b.entrante += c.saldo; });
    cxp.forEach((c) => { const v = new Date(c.fechaVencimiento).getTime(); const b = buckets.find((x) => v >= x.desde.getTime() && v < x.hasta.getTime()); if (b) b.saliente += c.saldo; });
    return buckets.map(({ periodo, entrante, saliente }) => ({ periodo, entrante, saliente }));
  }, [cxc, cxp]);

  const hayFlujo = flujoData.some((d) => d.entrante > 0 || d.saliente > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/treasury"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Bancos y Conciliación</h1>
          <p className="text-sm text-muted-foreground">Saldo total: <span className="font-semibold text-foreground">{formatCLP(saldoTotal)}</span></p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setMovOpen(true)}><Plus className="mr-1 h-3.5 w-3.5" />Movimiento</Button>
        <Button size="sm" className="h-8 text-xs" onClick={() => setCuentaOpen(true)}><Plus className="mr-1 h-3.5 w-3.5" />Cuenta</Button>
      </div>

      <NuevaCuentaBancariaDialog open={cuentaOpen} onOpenChange={setCuentaOpen} />
      <RegistrarMovimientoBancarioDialog open={movOpen} onOpenChange={setMovOpen} />

      {/* Cuentas bancarias */}
      {cuentas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <Landmark className="mx-auto mb-2 h-7 w-7 opacity-40" />
          Aún no hay cuentas bancarias. Crea la primera con <span className="font-medium text-foreground">Cuenta</span>.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cuentas.map((c) => {
            const movs = movPorCuenta[c.id] ?? [];
            return (
              <Card key={c.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{c.banco}</p>
                      <p className="font-mono text-xs text-muted-foreground">{c.numero}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px]">{c.tipo}</Badge>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${c.saldo >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCLP(c.saldo)}</p>
                      <p className="text-xs text-muted-foreground">Últ. mov.: {c.ultimaConciliacion ? formatDate(c.ultimaConciliacion) : '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {movs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Sin movimientos registrados.</p>
                    ) : movs.slice(0, 3).map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-xs">
                        <span className="mr-2 flex-1 truncate text-muted-foreground">{m.descripcion}</span>
                        <span className={m.tipo === 'abono' ? 'font-medium text-success' : 'font-medium text-destructive'}>
                          {m.monto > 0 ? '+' : ''}{formatCLP(m.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Flujo de caja proyectado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Flujo de Caja Proyectado — Próximos 30 días</CardTitle>
          <p className="text-xs text-muted-foreground">Derivado de CxC (cobros) y CxP (pagos) por vencimiento</p>
        </CardHeader>
        <CardContent>
          {!hayFlujo ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">
              Sin cobros ni pagos proyectados. Emite DTEs o registra DTE de proveedores para ver el flujo.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={flujoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: unknown) => formatCLP(v as number)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="entrante" name="CxC esperada" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar dataKey="saliente" name="CxP programada" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
