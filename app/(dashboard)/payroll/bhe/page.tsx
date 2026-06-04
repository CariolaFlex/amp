'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useBhe, useCrearBHE } from '@/lib/data/rrhh';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { formatRut } from '@/lib/utils/rut';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const TASA_RETENCION = 0.1525;
const now = new Date();
const periodoActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export default function BhePage() {
  const bhes = useBhe();
  const crearBHE = useCrearBHE();
  const [open, setOpen] = useState(false);
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [montoBruto, setMontoBruto] = useState('');
  const bruto = parseInt(montoBruto.replace(/\D/g, '')) || 0;
  const retencion = Math.round(bruto * TASA_RETENCION);
  const liquido = bruto - retencion;

  async function registrar() {
    if (!nombre.trim()) { toast.error('Ingrese el nombre del prestador'); return; }
    if (bruto <= 0) { toast.error('Ingrese el monto bruto'); return; }
    try {
      await crearBHE.mutateAsync({
        rut: rut.trim(),
        nombre: nombre.trim(),
        periodo: periodoActual,
        montoBruto: bruto,
      });
      toast.success('BHE registrada');
      setOpen(false);
      setRut(''); setNombre(''); setMontoBruto('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al registrar BHE');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/payroll"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Boletas de Honorarios (BHE)</h1>
          <p className="text-sm text-muted-foreground">Retención 15.25% · Artículo 74 LIR</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Nueva BHE</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Boleta de Honorarios</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">RUT del prestador</label>
                <Input value={rut} onChange={e => setRut(formatRut(e.target.value))} placeholder="11.234.567-K" className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Monto bruto</label>
                <Input
                  value={montoBruto ? formatCLP(bruto) : ''}
                  onChange={e => setMontoBruto(e.target.value)}
                  placeholder="$ 0"
                />
              </div>
              {bruto > 0 && (
                <Card className="border-border">
                  <CardContent className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monto bruto</span>
                      <span>{formatCLP(bruto)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retención 15.25%</span>
                      <span className="text-destructive">- {formatCLP(retencion)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Líquido a pagar</span>
                      <span className="text-success">{formatCLP(liquido)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Button className="w-full" onClick={registrar} disabled={crearBHE.isPending}>
                {crearBHE.isPending ? 'Registrando…' : 'Registrar BHE'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={bhes}
        getRowId={r => r.id}
        emptyMessage="Sin boletas registradas. Usa «Nueva BHE»."
        columns={[
          { key: 'rut',          header: 'RUT',           render: v => <span className="font-mono text-xs">{String(v)}</span> },
          { key: 'nombre',       header: 'Prestador',     sortable: true },
          { key: 'periodo',      header: 'Período' },
          { key: 'montoBruto',   header: 'Monto Bruto',   align: 'right', render: v => formatCLP(v as number) },
          { key: 'retencion',    header: 'Retención 15.25%', align: 'right', render: v => <span className="text-destructive">{formatCLP(v as number)}</span> },
          { key: 'montoLiquido', header: 'Líquido',       align: 'right', render: v => <span className="font-bold text-success">{formatCLP(v as number)}</span> },
          { key: 'fecha',        header: 'Fecha',         render: v => formatDate(v as Date) },
        ]}
      />
    </div>
  );
}
