'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useProveedores, useCrearProveedor, useCrearOC, useCrearDteProveedor } from '@/lib/data/compras';

const selectClass = 'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm';

/* ── Nuevo proveedor ─────────────────────────────────────────── */
const EMPTY_PROV = { rut: '', razonSocial: '', giro: '', contactoNombre: '', contactoEmail: '', contactoTelefono: '', condicionPago: '30 días' };

export function NuevoProveedorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState(EMPTY_PROV);
  const [saving, setSaving] = useState(false);
  const crearProveedor = useCrearProveedor();
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  React.useEffect(() => { if (open) setForm(EMPTY_PROV); }, [open]);

  async function crear() {
    if (!form.razonSocial.trim()) { toast.error('Ingrese la razón social'); return; }
    setSaving(true);
    try {
      await crearProveedor.mutateAsync({
        rut: form.rut.trim() || undefined,
        razonSocial: form.razonSocial.trim(),
        giro: form.giro.trim() || undefined,
        contactoNombre: form.contactoNombre.trim() || undefined,
        contactoEmail: form.contactoEmail.trim() || undefined,
        contactoTelefono: form.contactoTelefono.trim() || undefined,
        condicionPago: form.condicionPago,
      });
      toast.success('Proveedor creado');
      onOpenChange(false);
    } catch {
      toast.error('Error al crear el proveedor');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo proveedor</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><Label htmlFor="pr-rut">RUT</Label><Input id="pr-rut" value={form.rut} onChange={(e) => set('rut', e.target.value)} placeholder="76.xxx.xxx-x" className="mt-1 font-mono" /></div>
            <div className="col-span-2"><Label htmlFor="pr-rs">Razón social *</Label><Input id="pr-rs" value={form.razonSocial} onChange={(e) => set('razonSocial', e.target.value)} className="mt-1" /></div>
          </div>
          <div><Label htmlFor="pr-giro">Giro</Label><Input id="pr-giro" value={form.giro} onChange={(e) => set('giro', e.target.value)} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="pr-cn">Contacto</Label><Input id="pr-cn" value={form.contactoNombre} onChange={(e) => set('contactoNombre', e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Condición de pago</Label>
              <select className={selectClass} value={form.condicionPago} onChange={(e) => set('condicionPago', e.target.value)}>
                <option>Contado</option><option>30 días</option><option>60 días</option><option>90 días</option>
              </select>
            </div>
            <div><Label htmlFor="pr-em">Email</Label><Input id="pr-em" value={form.contactoEmail} onChange={(e) => set('contactoEmail', e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="pr-tel">Teléfono</Label><Input id="pr-tel" value={form.contactoTelefono} onChange={(e) => set('contactoTelefono', e.target.value)} className="mt-1" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={crear} disabled={saving}>{saving ? 'Creando…' : 'Crear proveedor'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Nueva Orden de Compra ──────────────────────────────────── */
export function NuevaOCDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const proveedores = useProveedores();
  const [proveedorId, setProveedorId] = useState('');
  const [total, setTotal] = useState('');
  const [saving, setSaving] = useState(false);
  const crearOC = useCrearOC();
  React.useEffect(() => { if (open) { setProveedorId(''); setTotal(''); } }, [open]);

  async function crear() {
    const prov = proveedores.find((p) => p.id === proveedorId);
    if (!prov) { toast.error('Seleccione un proveedor'); return; }
    setSaving(true);
    try {
      await crearOC.mutateAsync({
        proveedorId: prov.id,
        proveedorRut: prov.rut,
        proveedorNombre: prov.razonSocial,
        total: Number(total) || 0,
      });
      toast.success('Orden de compra creada');
      onOpenChange(false);
    } catch {
      toast.error('Error al crear la orden de compra');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva orden de compra</DialogTitle></DialogHeader>
        {proveedores.length === 0 ? (
          <p className="text-sm text-muted-foreground">Primero crea un proveedor.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Proveedor</Label>
              <select className={selectClass} value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
                <option value="">— Seleccionar —</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
              </select>
            </div>
            <div><Label htmlFor="oc-total">Total (CLP)</Label><Input id="oc-total" type="number" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0" className="mt-1" /></div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={crear} disabled={saving || proveedores.length === 0}>{saving ? 'Creando…' : 'Crear OC'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Registrar DTE recibido de proveedor ────────────────────── */
export function RegistrarDteProveedorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const proveedores = useProveedores();
  const [proveedorId, setProveedorId] = useState('');
  const [folio, setFolio] = useState('');
  const [total, setTotal] = useState('');
  const [saving, setSaving] = useState(false);
  const crearDte = useCrearDteProveedor();
  React.useEffect(() => { if (open) { setProveedorId(''); setFolio(''); setTotal(''); } }, [open]);

  async function crear() {
    const prov = proveedores.find((p) => p.id === proveedorId);
    if (!prov) { toast.error('Seleccione un proveedor'); return; }
    if (!folio.trim()) { toast.error('Ingrese el folio'); return; }
    setSaving(true);
    try {
      await crearDte.mutateAsync({
        proveedorId: prov.id,
        proveedorRut: prov.rut,
        proveedorNombre: prov.razonSocial,
        folio: Number(folio) || 0,
        total: Number(total) || 0,
      });
      toast.success('DTE de proveedor registrado');
      onOpenChange(false);
    } catch {
      toast.error('Error al registrar el DTE');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar DTE de proveedor</DialogTitle></DialogHeader>
        {proveedores.length === 0 ? (
          <p className="text-sm text-muted-foreground">Primero crea un proveedor.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Proveedor</Label>
              <select className={selectClass} value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
                <option value="">— Seleccionar —</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="dp-folio">Folio</Label><Input id="dp-folio" type="number" value={folio} onChange={(e) => setFolio(e.target.value)} className="mt-1 font-mono" /></div>
              <div><Label htmlFor="dp-total">Total (CLP)</Label><Input id="dp-total" type="number" value={total} onChange={(e) => setTotal(e.target.value)} className="mt-1" /></div>
            </div>
            <p className="text-xs text-muted-foreground">El plazo de acuse (8 días) se calcula desde hoy.</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={crear} disabled={saving || proveedores.length === 0}>{saving ? 'Registrando…' : 'Registrar DTE'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
