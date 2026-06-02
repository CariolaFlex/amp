'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { mockCxC, mockCxP } from '@/lib/mock/contabilidad';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import type { BucketAging } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Download } from 'lucide-react';

const AGING_COLORS: Record<BucketAging, string> = {
  '0-30': '#22c55e',
  '31-60': '#f59e0b',
  '61-90': '#f97316',
  '+90': '#ef4444',
};

const AGING_VARIANT: Record<BucketAging, 'success' | 'warning' | 'destructive' | 'default'> = {
  '0-30': 'success',
  '31-60': 'warning',
  '61-90': 'destructive',
  '+90': 'destructive',
};

const agingData = (['0-30', '31-60', '61-90', '+90'] as BucketAging[]).map(bucket => ({
  bucket,
  monto: mockCxC.filter(c => c.aging === bucket).reduce((s, c) => s + c.saldo, 0),
}));

export default function TreasuryPage() {
  const totalCxC = mockCxC.reduce((s, c) => s + c.saldo, 0);
  const totalCxP = mockCxP.reduce((s, c) => s + c.saldo, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tesorería</h1>
          <p className="text-sm text-muted-foreground">CxC, CxP y flujo de caja</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs"><Download className="h-3.5 w-3.5 mr-1" />Exportar</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cuentas por Cobrar</p>
            <p className="text-2xl font-bold text-success">{formatCLP(totalCxC)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{mockCxC.length} facturas pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cuentas por Pagar</p>
            <p className="text-2xl font-bold text-destructive">{formatCLP(totalCxP)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{mockCxP.length} facturas por pagar</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cxc">
        <TabsList>
          <TabsTrigger value="cxc" className="text-xs">Cuentas por Cobrar</TabsTrigger>
          <TabsTrigger value="cxp" className="text-xs">Cuentas por Pagar</TabsTrigger>
          <TabsTrigger value="aging" className="text-xs">Aging</TabsTrigger>
        </TabsList>

        <TabsContent value="cxc">
          <DataTable
            data={mockCxC}
            getRowId={(r) => r.id}
            searchPlaceholder="Buscar por cliente..."
            exportable
            columns={[
              { key: 'clienteNombre', header: 'Cliente', sortable: true },
              { key: 'clienteRut', header: 'RUT', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
              { key: 'folioDte', header: 'Folio', width: '80px', render: (v) => <span className="font-mono">#{String(v)}</span> },
              { key: 'fechaEmision', header: 'Emisión', sortable: true, render: (v) => formatDate(v as Date) },
              { key: 'fechaVencimiento', header: 'Vencimiento', sortable: true, render: (v) => formatDate(v as Date) },
              { key: 'saldo', header: 'Saldo', align: 'right', sortable: true, render: (v) => <span className="font-medium">{formatCLP(v as number)}</span> },
              { key: 'aging', header: 'Aging', render: (v) => <Badge variant={AGING_VARIANT[v as BucketAging]}>{String(v)} días</Badge> },
            ]}
            rowClassName={(row) => row.aging === '+90' ? 'bg-destructive/5' : undefined}
          />
        </TabsContent>

        <TabsContent value="cxp">
          <DataTable
            data={mockCxP}
            getRowId={(r) => r.id}
            searchPlaceholder="Buscar por proveedor..."
            columns={[
              { key: 'proveedorNombre', header: 'Proveedor', sortable: true },
              { key: 'proveedorRut', header: 'RUT', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
              { key: 'folioDte', header: 'Folio', width: '80px', render: (v) => <span className="font-mono">#{String(v)}</span> },
              { key: 'fechaVencimiento', header: 'Vencimiento', sortable: true, render: (v) => formatDate(v as Date) },
              { key: 'saldo', header: 'Saldo', align: 'right', sortable: true, render: (v) => <span className="font-medium text-destructive">{formatCLP(v as number)}</span> },
            ]}
          />
        </TabsContent>

        <TabsContent value="aging">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Aging de CxC por bucket</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: unknown) => [formatCLP(v as number), 'Saldo']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="monto" radius={[4, 4, 0, 0]}>
                    {agingData.map((entry) => (
                      <Cell key={entry.bucket} fill={AGING_COLORS[entry.bucket]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {agingData.map(d => (
                  <div key={d.bucket} className="text-center">
                    <p className="text-xs text-muted-foreground">{d.bucket} días</p>
                    <p className="text-sm font-bold">{formatCLP(d.monto)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
