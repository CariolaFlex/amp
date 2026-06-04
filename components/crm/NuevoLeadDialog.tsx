'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCrearLead } from '@/lib/data/crm';

const FUENTES = ['Referido', 'Web', 'LinkedIn', 'Redes sociales', 'Llamada en frío', 'Evento', 'Otro'];
const selectClass = 'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function NuevoLeadDialog({ open, onOpenChange }: Props) {
  const crearLead = useCrearLead();
  const [form, setForm] = useState({ nombre: '', empresa: '', rut: '', email: '', telefono: '', fuente: 'Referido' });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  React.useEffect(() => {
    if (open) setForm({ nombre: '', empresa: '', rut: '', email: '', telefono: '', fuente: 'Referido' });
  }, [open]);

  async function handleCrear() {
    if (!form.nombre.trim()) { toast.error('Ingrese el nombre del lead'); return; }
    setSaving(true);
    await crearLead.mutateAsync({
      nombre: form.nombre.trim(),
      empresa: form.empresa.trim(),
      rut: form.rut.trim() || undefined,
      email: form.email.trim() || undefined,
      telefono: form.telefono.trim() || undefined,
      fuente: form.fuente,
    });
    toast.success('Lead creado');
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo lead</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="l-nombre">Nombre *</Label><Input id="l-nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Nombre contacto" className="mt-1" /></div>
            <div><Label htmlFor="l-empresa">Empresa</Label><Input id="l-empresa" value={form.empresa} onChange={(e) => set('empresa', e.target.value)} placeholder="Empresa" className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="l-rut">RUT</Label><Input id="l-rut" value={form.rut} onChange={(e) => set('rut', e.target.value)} placeholder="12.345.678-9" className="mt-1 font-mono" /></div>
            <div>
              <Label>Fuente</Label>
              <select className={selectClass} value={form.fuente} onChange={(e) => set('fuente', e.target.value)}>
                {FUENTES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="l-email">Email</Label><Input id="l-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="correo@empresa.cl" className="mt-1" /></div>
            <div><Label htmlFor="l-tel">Teléfono</Label><Input id="l-tel" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} placeholder="+56 9 ..." className="mt-1" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCrear} disabled={saving}>{saving ? 'Creando…' : 'Crear lead'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
