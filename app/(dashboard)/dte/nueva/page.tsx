'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCLP } from '@/lib/utils/clp';
import { useProductos } from '@/lib/data/inventory';
import { useClientes, nombreCliente } from '@/lib/data/clientes';
import { useCrearCotizacion, calcTotales, aplicaIva } from '@/lib/data/ventas';
import { useOportunidad } from '@/lib/data/crm';
import { useSession } from 'next-auth/react';
import { Plus, Trash2, ArrowLeft, Save, Send } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { genId } from '@/lib/data/collection';
import type { LineaDte, TipoDte, EstadoCotizacion } from '@/types';

const TIPOS_DTE = [
  { value: '33', label: 'Factura Afecta (33)' },
  { value: '34', label: 'Factura Exenta (34)' },
  { value: '39', label: 'Boleta Electrónica (39)' },
  { value: '61', label: 'Nota de Crédito (61)' },
];

interface LineaEdit { id: string; descripcion: string; cantidad: number; precioUnitario: number; descuento: number; productoId?: string; }

const lineaVacia = (): LineaEdit => ({ id: genId(), descripcion: '', cantidad: 1, precioUnitario: 0, descuento: 0 });

function toLineaDte(l: LineaEdit): LineaDte {
  const total = Math.round(l.cantidad * l.precioUnitario * (1 - l.descuento / 100));
  return { id: l.id, descripcion: l.descripcion, cantidad: l.cantidad, precioUnitario: l.precioUnitario, descuento: l.descuento, total, productoId: l.productoId };
}

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const clientes = useClientes();
  const productos = useProductos();
  const { data: session } = useSession();
  const user = session?.user;
  const crearCotizacion = useCrearCotizacion();

  const [oportunidadId, setOportunidadId] = useState<string | undefined>(undefined);
  const oportunidad = useOportunidad(oportunidadId);

  const [tipoDte, setTipoDte] = useState('33');
  const [clienteId, setClienteId] = useState('');
  const [clienteManual, setClienteManual] = useState({ nombre: '', rut: '' });
  const [condicionPago, setCondicionPago] = useState('30');
  const [lineas, setLineas] = useState<LineaEdit[]>([lineaVacia()]);
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const [opPrefilled, setOpPrefilled] = useState(false);

  const tipoNum = Number(tipoDte) as TipoDte;
  const lineasDte = lineas.map(toLineaDte);
  const { neto, iva, total } = calcTotales(lineasDte, tipoNum);

  const cli = clientes.find((c) => c.id === clienteId);

  // Prefill desde query params al llegar desde CRM/ficha cliente
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rut = params.get('clienteRut');
    const opId = params.get('oportunidadId');
    if (opId) setOportunidadId(opId);
    if (rut && clientes.length > 0 && !clienteId) {
      const match = clientes.find((c) => c.rut === rut);
      if (match) setClienteId(match.id);
    }
  }, [clientes, clienteId]);

  // Prefill una línea con el título y monto de la oportunidad (una sola vez)
  React.useEffect(() => {
    if (!oportunidad || opPrefilled) return;
    setLineas([{ id: genId(), descripcion: oportunidad.titulo, cantidad: 1, precioUnitario: oportunidad.monto, descuento: 0 }]);
    setOpPrefilled(true);
  }, [oportunidad, opPrefilled]);

  const addLinea = () => setLineas((p) => [...p, lineaVacia()]);
  const removeLinea = (id: string) => setLineas((p) => p.filter((l) => l.id !== id));
  const updateLinea = (id: string, field: keyof LineaEdit, value: string | number) =>
    setLineas((p) => p.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  async function guardar(estado: EstadoCotizacion) {
    const clienteNombre = cli ? nombreCliente(cli) : clienteManual.nombre.trim();
    const clienteRut = cli ? (cli.rut ?? '') : clienteManual.rut.trim();
    if (!clienteNombre) { toast.error('Seleccione o ingrese el cliente'); return; }
    if (lineasDte.every((l) => !l.descripcion.trim())) { toast.error('Agregue al menos una línea con descripción'); return; }

    setSaving(true);
    try {
      await crearCotizacion.mutateAsync({
        clienteId: cli?.id,
        clienteNombre,
        clienteRut,
        tipoDte: tipoNum,
        condicionPago,
        lineas: lineasDte.filter((l) => l.descripcion.trim()),
        neto, iva, total,
        notas: notas.trim() || undefined,
        estado,
        vendedorId: user?.id,
        vendedorNombre: user?.name ?? undefined,
      });
      toast.success(estado === 'enviada' ? 'Cotización creada y enviada' : 'Cotización guardada como borrador');
      router.push('/dte/cotizaciones');
    } catch {
      toast.error('Error al guardar la cotización');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/dte/cotizaciones"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Nueva Cotización</h1>
          <p className="text-sm text-muted-foreground">Flujo: Cotización → Orden de Venta → DTE</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => guardar('borrador')} disabled={saving}>
            <Save className="mr-1 h-3.5 w-3.5" />Guardar borrador
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => guardar('enviada')} disabled={saving}>
            <Send className="mr-1 h-3.5 w-3.5" />Guardar y enviar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Encabezado</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tipo de documento</label>
                  <Select value={tipoDte} onValueChange={setTipoDte}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{TIPOS_DTE.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Condición de pago</label>
                  <Select value={condicionPago} onValueChange={setCondicionPago}>
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
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Cliente</label>
                {clientes.length > 0 ? (
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{nombreCliente(c)}{c.rut ? ` · ${c.rut}` : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={clienteManual.nombre} onChange={(e) => setClienteManual((s) => ({ ...s, nombre: e.target.value }))} placeholder="Nombre cliente" className="h-9 text-sm" />
                    <Input value={clienteManual.rut} onChange={(e) => setClienteManual((s) => ({ ...s, rut: e.target.value }))} placeholder="RUT" className="h-9 font-mono text-sm" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Líneas de detalle</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addLinea}><Plus className="mr-1 h-3.5 w-3.5" />Agregar línea</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium text-muted-foreground">
                  <span className="col-span-5">Descripción</span>
                  <span className="col-span-2 text-right">Cantidad</span>
                  <span className="col-span-2 text-right">P. Unitario</span>
                  <span className="col-span-1 text-right">Dto%</span>
                  <span className="col-span-1 text-right">Total</span>
                  <span className="col-span-1" />
                </div>
                {lineas.map((linea) => {
                  const subtotal = Math.round(linea.cantidad * linea.precioUnitario * (1 - linea.descuento / 100));
                  return (
                    <div key={linea.id} className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-5"><Input value={linea.descripcion} onChange={(e) => updateLinea(linea.id, 'descripcion', e.target.value)} placeholder="Descripción" className="h-8 text-xs" /></div>
                      <div className="col-span-2"><Input type="number" value={linea.cantidad} onChange={(e) => updateLinea(linea.id, 'cantidad', Number(e.target.value))} className="h-8 text-right text-xs" min={1} /></div>
                      <div className="col-span-2"><Input type="number" value={linea.precioUnitario} onChange={(e) => updateLinea(linea.id, 'precioUnitario', Number(e.target.value))} className="h-8 text-right text-xs" /></div>
                      <div className="col-span-1"><Input type="number" value={linea.descuento} onChange={(e) => updateLinea(linea.id, 'descuento', Number(e.target.value))} className="h-8 text-right text-xs" min={0} max={100} /></div>
                      <div className="col-span-1 text-right text-xs font-medium">{formatCLP(subtotal)}</div>
                      <div className="col-span-1 flex justify-end">
                        <button onClick={() => removeLinea(linea.id)} className="text-muted-foreground transition-colors hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Notas / Observaciones</label>
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Condiciones especiales, referencias de proyecto, etc." rows={3} className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Resumen</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Neto</span><span className="font-medium">{formatCLP(neto)}</span></div>
                {aplicaIva(tipoNum) ? (
                  <div className="flex justify-between"><span className="text-muted-foreground">IVA 19%</span><span className="font-medium">{formatCLP(iva)}</span></div>
                ) : (
                  <div className="flex justify-between"><span className="text-muted-foreground">Exento</span><Badge variant="muted" className="text-[10px]">Sin IVA</Badge></div>
                )}
                <div className="flex justify-between border-t pt-2"><span className="font-bold">TOTAL</span><span className="text-lg font-bold text-primary">{formatCLP(total)}</span></div>
              </div>
              <div className="space-y-2 pt-2">
                <Button className="h-9 w-full text-sm" onClick={() => guardar('enviada')} disabled={saving}><Send className="mr-1.5 h-4 w-4" />Guardar y enviar</Button>
                <Button variant="outline" className="h-9 w-full text-sm" onClick={() => guardar('borrador')} disabled={saving}>Guardar como borrador</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground">AGREGAR PRODUCTO</CardTitle></CardHeader>
            <CardContent className="p-3 pt-0">
              {productos.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">No hay productos. Créalos en Inventario.</p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {productos.slice(0, 12).map((p) => (
                    <button key={p.id} onClick={() => setLineas((prev) => [...prev, { id: genId(), descripcion: p.nombre, cantidad: 1, precioUnitario: p.precioVenta, descuento: 0, productoId: p.id }])} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted">
                      <span className="truncate">{p.nombre}</span>
                      <span className="ml-2 flex-shrink-0 font-medium text-primary">{formatCLP(p.precioVenta)}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
