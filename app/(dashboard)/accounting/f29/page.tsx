'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCLP } from '@/lib/utils/clp';
import { Download } from 'lucide-react';

const f29Items = [
  { codigo: '501', descripcion: 'Ventas netas afectas (base imponible)', monto: 18655462 },
  { codigo: '502', descripcion: 'Ventas exentas / no gravadas', monto: 2100000 },
  { codigo: '503', descripcion: 'Débito fiscal (19%)', monto: 3544538 },
  { codigo: '524', descripcion: 'Crédito fiscal compras', monto: 768000 },
  { codigo: '538', descripcion: 'Total IVA a pagar (503 - 524)', monto: 2776538 },
  { codigo: '563', descripcion: 'PPM tentativo (1.5% ventas netas)', monto: 279832 },
  { codigo: '91', descripcion: 'TOTAL A PAGAR', monto: 3056370 },
];

export default function F29Page() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Propuesta F29</h1>
          <p className="text-sm text-muted-foreground">Mayo 2026 — Período tributario</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs"><Download className="h-3.5 w-3.5 mr-1" />Exportar SII</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Formulario 29 — Código por código</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs text-muted-foreground">Código</th>
                <th className="px-4 py-2.5 text-left text-xs text-muted-foreground">Descripción</th>
                <th className="px-4 py-2.5 text-right text-xs text-muted-foreground">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {f29Items.map(item => (
                <tr key={item.codigo} className={item.codigo === '91' ? 'bg-primary/5 font-semibold' : 'hover:bg-muted/30'}>
                  <td className="px-4 py-2.5 font-mono text-xs">{item.codigo}</td>
                  <td className="px-4 py-2.5 text-sm">{item.descripcion}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{formatCLP(item.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
