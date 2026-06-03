'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAsientos } from '@/lib/data/contabilidad';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function MayorPage() {
  const asientos = useAsientos();
  const cuentas = useMemo(
    () => Array.from(new Set(asientos.map(a => a.cuentaCodigo))).map(codigo => {
      const asientosCuenta = asientos.filter(a => a.cuentaCodigo === codigo);
      return { codigo, nombre: asientosCuenta[0].cuentaNombre, asientos: asientosCuenta };
    }),
    [asientos],
  );
  const [cuentaActiva, setCuentaActiva] = useState<string | undefined>(undefined);
  const cuenta = cuentas.find(c => c.codigo === (cuentaActiva ?? cuentas[0]?.codigo));

  let saldoAcumulado = 0;
  const asientosConSaldo = (cuenta?.asientos ?? []).map(a => {
    saldoAcumulado += a.debe - a.haber;
    return { ...a, saldo: saldoAcumulado };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/accounting"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Libro Mayor</h1>
          <p className="text-sm text-muted-foreground">Por cuenta contable · Mayo 2026</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs"><Download className="h-3.5 w-3.5 mr-1" />Exportar</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Lista de cuentas */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cuentas</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {cuentas.map(c => (
                  <button
                    key={c.codigo}
                    onClick={() => setCuentaActiva(c.codigo)}
                    className={`w-full text-left rounded-md px-2.5 py-2 text-xs transition-colors ${cuentaActiva === c.codigo ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <span className="font-mono block">{c.codigo}</span>
                    <span className="truncate block">{c.nombre}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mayor de la cuenta */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                <span className="font-mono text-primary mr-2">{cuenta?.codigo}</span>
                {cuenta?.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs text-muted-foreground">Fecha</th>
                    <th className="px-4 py-2.5 text-left text-xs text-muted-foreground">Glosa</th>
                    <th className="px-4 py-2.5 text-right text-xs text-muted-foreground">Debe</th>
                    <th className="px-4 py-2.5 text-right text-xs text-muted-foreground">Haber</th>
                    <th className="px-4 py-2.5 text-right text-xs text-muted-foreground">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {asientosConSaldo.map((a, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 text-xs">{formatDate(a.fecha)}</td>
                      <td className="px-4 py-2.5 text-xs max-w-xs truncate">{a.glosa}</td>
                      <td className="px-4 py-2.5 text-right text-xs">{a.debe > 0 ? formatCLP(a.debe) : '—'}</td>
                      <td className="px-4 py-2.5 text-right text-xs">{a.haber > 0 ? formatCLP(a.haber) : '—'}</td>
                      <td className={`px-4 py-2.5 text-right text-xs font-medium ${a.saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCLP(Math.abs(a.saldo))} {a.saldo >= 0 ? 'D' : 'H'}
                      </td>
                    </tr>
                  ))}
                  {/* Totales */}
                  <tr className="bg-muted/40 font-semibold">
                    <td colSpan={2} className="px-4 py-2.5 text-xs">TOTALES</td>
                    <td className="px-4 py-2.5 text-right text-xs">{formatCLP(asientosConSaldo.reduce((s, a) => s + a.debe, 0))}</td>
                    <td className="px-4 py-2.5 text-right text-xs">{formatCLP(asientosConSaldo.reduce((s, a) => s + a.haber, 0))}</td>
                    <td className={`px-4 py-2.5 text-right text-xs ${saldoAcumulado >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCLP(Math.abs(saldoAcumulado))} {saldoAcumulado >= 0 ? 'D' : 'H'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
