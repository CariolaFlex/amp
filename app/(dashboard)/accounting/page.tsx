'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useAsientos } from '@/lib/data/contabilidad';
import { NuevoAsientoDialog } from '@/components/accounting/NuevoAsientoDialog';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { Plus, Lock, Unlock, Download } from 'lucide-react';
import { exportarLibroDiarioExcel } from '@/lib/utils/export-excel';
import Link from 'next/link';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const now = new Date();
const periodoActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
function labelPeriodo(value: string) {
  const [y, m] = value.split('-');
  return `${MESES[Number(m) - 1]} ${y}`;
}
const PERIODOS = [
  { value: periodoActual, label: labelPeriodo(periodoActual), estado: 'abierto' },
  { value: '2026-05', label: 'Mayo 2026', estado: 'cerrado' },
  { value: '2026-04', label: 'Abril 2026', estado: 'bloqueado' },
].filter((p, i, arr) => arr.findIndex((x) => x.value === p.value) === i);

export default function AccountingPage() {
  const asientos = useAsientos();
  const [periodo, setPeriodo] = useState(periodoActual);
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const asientosFiltrados = asientos.filter(a => a.periodo === periodo);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Contabilidad</h1>
          <p className="text-sm text-muted-foreground">Libro Diario, Mayor, Balance y F29</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm" className="h-8 text-xs"
            onClick={() => exportarLibroDiarioExcel({ periodo, asientos: asientosFiltrados })}
            disabled={asientosFiltrados.length === 0}
          >
            <Download className="h-3.5 w-3.5 mr-1" />Excel
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => setNuevoOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />Nuevo asiento</Button>
        </div>
      </div>

      <NuevoAsientoDialog open={nuevoOpen} onOpenChange={setNuevoOpen} />

      {/* Sub-nav */}
      <div className="flex items-center gap-1 border-b">
        {[
          { label: 'Libro Diario', href: '/accounting' },
          { label: 'Libro Mayor', href: '/accounting/mayor' },
          { label: 'Balance', href: '/accounting/balance' },
          { label: 'F29', href: '/accounting/f29' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="px-3 py-2 text-xs font-medium border-b-2 border-primary text-primary transition-colors">
            {item.label}
          </Link>
        ))}
      </div>

      {/* Selector de período */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-medium">Período:</span>
        <div className="flex items-center gap-1">
          {PERIODOS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors border ${periodo === p.value ? 'bg-muted border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {p.estado === 'cerrado' && <Lock className="h-3 w-3" />}
              {p.estado === 'bloqueado' && <Lock className="h-3 w-3 text-destructive" />}
              {p.estado === 'abierto' && <Unlock className="h-3 w-3 text-success" />}
              {p.label}
              <Badge variant={p.estado === 'abierto' ? 'success' : p.estado === 'cerrado' ? 'secondary' : 'destructive'} className="text-[10px]">
                {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Debe</p>
            <p className="text-lg font-bold">{formatCLP(asientosFiltrados.reduce((s, a) => s + a.debe, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Haber</p>
            <p className="text-lg font-bold">{formatCLP(asientosFiltrados.reduce((s, a) => s + a.haber, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Asientos</p>
            <p className="text-lg font-bold">{asientosFiltrados.length}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={asientosFiltrados}
        getRowId={(r) => r.id}
        searchPlaceholder="Buscar en libro diario..."
        exportable
        emptyMessage="Sin asientos en este período. Crea uno con «Nuevo asiento»."
        columns={[
          { key: 'fecha', header: 'Fecha', sortable: true, width: '100px', render: (v) => formatDate(v as Date) },
          { key: 'numero', header: 'N° Asiento', width: '80px', render: (v) => <span className="font-mono">{String(v)}</span> },
          { key: 'cuentaCodigo', header: 'Cuenta', width: '100px', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
          { key: 'cuentaNombre', header: 'Nombre Cuenta' },
          { key: 'glosa', header: 'Glosa' },
          { key: 'debe', header: 'Debe', align: 'right', sortable: true, render: (v) => (v as number) > 0 ? <span className="font-medium">{formatCLP(v as number)}</span> : <span className="text-muted-foreground">—</span> },
          { key: 'haber', header: 'Haber', align: 'right', sortable: true, render: (v) => (v as number) > 0 ? <span className="font-medium">{formatCLP(v as number)}</span> : <span className="text-muted-foreground">—</span> },
        ]}
      />
    </div>
  );
}
