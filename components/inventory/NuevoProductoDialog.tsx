'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCrearProducto } from '@/lib/data/inventory';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const EMPTY = { sku: '', nombre: '', categoria: '', unidad: 'un', precioVenta: '', costoPMP: '', stockInicial: '', stockMinimo: '' };

export function NuevoProductoDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const crearProducto = useCrearProducto();
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  React.useEffect(() => { if (open) setForm(EMPTY); }, [open]);

  async function handleCrear() {
    if (!form.sku.trim()) { toast.error('Ingrese el SKU'); return; }
    if (!form.nombre.trim()) { toast.error('Ingrese el nombre del producto'); return; }

    setSaving(true);
    try {
      await crearProducto.mutateAsync({
        sku: form.sku.trim().toUpperCase(),
        nombre: form.nombre.trim(),
        categoria: form.categoria.trim() || 'Sin categoría',
        precioVenta: Number(form.precioVenta) || 0,
        costoPMP: Number(form.costoPMP) || 0,
        stockDisponible: Number(form.stockInicial) || 0,
        stockMinimo: Number(form.stockMinimo) || 0,
        unidad: form.unidad.trim() || 'un',
      });
      toast.success('Producto creado');
      onOpenChange(false);
    } catch {
      toast.error('Error al crear el producto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo producto</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><Label htmlFor="p-sku">SKU *</Label><Input id="p-sku" value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="ACE-001" className="mt-1 font-mono" /></div>
            <div className="col-span-2"><Label htmlFor="p-nombre">Nombre *</Label><Input id="p-nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Descripción del producto" className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="p-cat">Categoría</Label><Input id="p-cat" value={form.categoria} onChange={(e) => set('categoria', e.target.value)} placeholder="Ej: Acero" className="mt-1" /></div>
            <div><Label htmlFor="p-unidad">Unidad</Label><Input id="p-unidad" value={form.unidad} onChange={(e) => set('unidad', e.target.value)} placeholder="un / kg / mt / saco" className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="p-precio">Precio venta (CLP)</Label><Input id="p-precio" type="number" value={form.precioVenta} onChange={(e) => set('precioVenta', e.target.value)} placeholder="0" className="mt-1" /></div>
            <div><Label htmlFor="p-costo">Costo PMP (CLP)</Label><Input id="p-costo" type="number" value={form.costoPMP} onChange={(e) => set('costoPMP', e.target.value)} placeholder="0" className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="p-stock">Stock inicial</Label><Input id="p-stock" type="number" value={form.stockInicial} onChange={(e) => set('stockInicial', e.target.value)} placeholder="0" className="mt-1" /></div>
            <div><Label htmlFor="p-min">Stock mínimo</Label><Input id="p-min" type="number" value={form.stockMinimo} onChange={(e) => set('stockMinimo', e.target.value)} placeholder="0" className="mt-1" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCrear} disabled={saving}>{saving ? 'Creando…' : 'Crear producto'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
