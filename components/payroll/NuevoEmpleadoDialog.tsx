'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { formatRut } from '@/lib/utils/rut';
import { useCrearEmpleado } from '@/lib/data/rrhh';
import type { TipoContrato } from '@/types';

const selectClass = 'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm';
const EMPTY = { rut: '', nombre: '', cargo: '', contrato: 'indefinido' as TipoContrato, banco: '', numeroCuenta: '', sueldoBase: '', fechaIngreso: new Date().toISOString().slice(0, 10) };

export function NuevoEmpleadoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState(EMPTY);
  const crearEmpleado = useCrearEmpleado();
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  React.useEffect(() => { if (open) setForm(EMPTY); }, [open]);

  async function crear() {
    if (!form.nombre.trim()) { toast.error('Ingrese el nombre'); return; }
    try {
      await crearEmpleado.mutateAsync({
        rut: form.rut.trim(),
        nombre: form.nombre.trim(),
        cargo: form.cargo.trim(),
        contrato: form.contrato,
        banco: form.banco.trim(),
        numeroCuenta: form.numeroCuenta.trim(),
        sueldoBase: Number(form.sueldoBase) || 0,
        fechaIngreso: form.fechaIngreso,
      });
      toast.success('Empleado creado');
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al crear empleado');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo empleado</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="e-rut">RUT</Label><Input id="e-rut" value={form.rut} onChange={(e) => set('rut', formatRut(e.target.value))} placeholder="14.567.890-1" className="mt-1 font-mono" /></div>
            <div><Label htmlFor="e-nombre">Nombre *</Label><Input id="e-nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="e-cargo">Cargo</Label><Input id="e-cargo" value={form.cargo} onChange={(e) => set('cargo', e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Contrato</Label>
              <select className={selectClass} value={form.contrato} onChange={(e) => set('contrato', e.target.value)}>
                <option value="indefinido">Indefinido</option>
                <option value="plazo_fijo">Plazo Fijo</option>
                <option value="obra_faena">Obra / Faena</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="e-banco">Banco</Label><Input id="e-banco" value={form.banco} onChange={(e) => set('banco', e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="e-cuenta">N° Cuenta</Label><Input id="e-cuenta" value={form.numeroCuenta} onChange={(e) => set('numeroCuenta', e.target.value)} className="mt-1 font-mono" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="e-sueldo">Sueldo base (CLP)</Label><Input id="e-sueldo" type="number" value={form.sueldoBase} onChange={(e) => set('sueldoBase', e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="e-ingreso">Fecha ingreso</Label><Input id="e-ingreso" type="date" value={form.fechaIngreso} onChange={(e) => set('fechaIngreso', e.target.value)} className="mt-1" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={crear} disabled={crearEmpleado.isPending}>{crearEmpleado.isPending ? 'Creando…' : 'Crear empleado'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
