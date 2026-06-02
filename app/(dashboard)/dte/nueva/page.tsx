'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCLP } from '@/lib/utils/clp';
import { formatRut } from '@/lib/utils/rut';
import { mockProductos } from '@/lib/mock/productos';
import { Plus, Trash2, ArrowLeft, Eye, Send } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Linea {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
}

const TIPOS_DTE = [
  { value: '33', label: 'Factura Afecta (33)' },
  { value: '34', label: 'Factura Exenta (34)' },
  { value: '39', label: 'Boleta Electrónica (39)' },
  { value: '61', label: 'Nota de Crédito (61)' },
];

const initialLineas: Linea[] = [
  { id: '1', descripcion: 'Servicio de excavación', cantidad: 1, precioUnitario: 15126050, descuento: 0 },
];

export default function NuevaDtePage() {
  const [tipoDte, setTipoDte] = useState('33');
  const [rutCliente, setRutCliente] = useState('78.456.789-0');
  const [lineas, setLineas] = useState<Linea[]>(initialLineas);
  const [notas, setNotas] = useState('');

  const neto = lineas.reduce((s, l) => s + (l.cantidad * l.precioUnitario * (1 - l.descuento / 100)), 0);
  const iva = tipoDte === '33' || tipoDte === '39' ? Math.round(neto * 0.19) : 0;
  const total = neto + iva;

  const addLinea = () => {
    setLineas(prev => [...prev, { id: Date.now().toString(), descripcion: '', cantidad: 1, precioUnitario: 0, descuento: 0 }]);
  };

  const removeLinea = (id: string) => setLineas(prev => prev.filter(l => l.id !== id));

  const updateLinea = (id: string, field: keyof Linea, value: string | number) => {
    setLineas(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/dte"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Nueva Cotización / DTE</h1>
          <p className="text-sm text-muted-foreground">Flujo: Cotización → Orden de Venta → DTE</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Eye className="h-3.5 w-3.5 mr-1" />Vista previa PDF
          </Button>
          <Button size="sm" className="h-8 text-xs">
            <Send className="h-3.5 w-3.5 mr-1" />Emitir al SII
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Encabezado DTE */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Encabezado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tipo de documento</label>
                  <Select value={tipoDte} onValueChange={setTipoDte}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_DTE.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Fecha de emisión</label>
                  <Input type="date" defaultValue="2026-06-01" className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">RUT cliente</label>
                  <Input
                    value={rutCliente}
                    onChange={e => setRutCliente(formatRut(e.target.value))}
                    placeholder="78.456.789-0"
                    className="font-mono h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Razón social</label>
                  <Input defaultValue="Minera Atacama SA" className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Fecha vencimiento</label>
                  <Input type="date" defaultValue="2026-07-01" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Condición de pago</label>
                  <Select defaultValue="30">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Contado</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="60">60 días</SelectItem>
                      <SelectItem value="90">90 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Líneas */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Líneas de detalle</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addLinea}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Agregar línea
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                  <span className="col-span-5">Descripción</span>
                  <span className="col-span-2 text-right">Cantidad</span>
                  <span className="col-span-2 text-right">P. Unitario</span>
                  <span className="col-span-1 text-right">Dto%</span>
                  <span className="col-span-1 text-right">Total</span>
                  <span className="col-span-1" />
                </div>

                {lineas.map((linea) => {
                  const subtotal = linea.cantidad * linea.precioUnitario * (1 - linea.descuento / 100);
                  return (
                    <div key={linea.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          value={linea.descripcion}
                          onChange={e => updateLinea(linea.id, 'descripcion', e.target.value)}
                          placeholder="Descripción del servicio o producto"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={linea.cantidad}
                          onChange={e => updateLinea(linea.id, 'cantidad', Number(e.target.value))}
                          className="h-8 text-xs text-right"
                          min={1}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={linea.precioUnitario}
                          onChange={e => updateLinea(linea.id, 'precioUnitario', Number(e.target.value))}
                          className="h-8 text-xs text-right"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={linea.descuento}
                          onChange={e => updateLinea(linea.id, 'descuento', Number(e.target.value))}
                          className="h-8 text-xs text-right"
                          min={0} max={100}
                        />
                      </div>
                      <div className="col-span-1 text-right text-xs font-medium">
                        {formatCLP(subtotal)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => removeLinea(linea.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notas */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Notas / Observaciones</label>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Condiciones especiales, referencias de proyecto, etc."
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Neto</span>
                  <span className="font-medium">{formatCLP(neto)}</span>
                </div>
                {tipoDte === '33' || tipoDte === '39' ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA 19%</span>
                    <span className="font-medium">{formatCLP(iva)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exento</span>
                    <Badge variant="muted" className="text-[10px]">Sin IVA</Badge>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">TOTAL</span>
                  <span className="font-bold text-lg text-primary">{formatCLP(total)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tipo</span>
                  <Badge variant="secondary">{TIPOS_DTE.find(t => t.value === tipoDte)?.label}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Folio (próximo)</span>
                  <span className="font-mono font-medium">#1030</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ambiente</span>
                  <Badge variant="warning">Certificación</Badge>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button className="w-full h-9 text-sm">
                  <Send className="h-4 w-4 mr-1.5" />Emitir al SII
                </Button>
                <Button variant="outline" className="w-full h-9 text-sm">
                  Guardar como borrador
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Productos rápidos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">AGREGAR PRODUCTO</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {mockProductos.slice(0, 6).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setLineas(prev => [...prev, {
                      id: Date.now().toString(),
                      descripcion: p.nombre,
                      cantidad: 1,
                      precioUnitario: p.precioVenta,
                      descuento: 0,
                    }])}
                    className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-muted transition-colors text-left"
                  >
                    <span className="truncate">{p.nombre}</span>
                    <span className="ml-2 flex-shrink-0 text-primary font-medium">{formatCLP(p.precioVenta)}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
