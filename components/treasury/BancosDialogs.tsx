'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCrearBancaria, useRegistrarMovimiento, useCuentasBancarias } from '@/lib/data/bancos';

const selectClass = 'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm';

export function NuevaCuentaBancariaDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState({ banco: '', numero: '', tipo: 'Cuenta Corriente', saldo: '' });
  const crearBancaria = useCrearBancaria();
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  React.useEffect(() => { if (open) setForm({ banco: '', numero: '', tipo: 'Cuenta Corriente', saldo: '' }); }, [open]);

  async function crear() {
    if (!form.banco.trim()) { toast.error('Ingrese el banco'); return; }
    try {
      await crearBancaria.mutateAsync({
        banco: form.banco.trim(),
        numero: form.numero.trim(),
        tipo: form.tipo,
        saldo: Number(form.saldo) || 0,
      });
      toast.success('Cuenta bancaria creada');
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al crear cuenta');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva cuenta bancaria</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label htmlFor="cb-banco">Banco</Label><Input id="cb-banco" value={form.banco} onChange={(e) => set('banco', e.target.value)} placeholder="Banco de Chile" className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="cb-num">N° Cuenta</Label><Input id="cb-num" value={form.numero} onChange={(e) => set('numero', e.target.value)} className="mt-1 font-mono" /></div>
            <div>
              <Label>Tipo</Label>
              <select className={selectClass} value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
                <option>Cuenta Corriente</option><option>Cuenta Vista</option><option>Cuenta Ahorro</option>
              </select>
            </div>
          </div>
          <div><Label htmlFor="cb-saldo">Saldo inicial (CLP)</Label><Input id="cb-saldo" type="number" value={form.saldo} onChange={(e) => set('saldo', e.target.value)} placeholder="0" className="mt-1" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={crear} disabled={crearBancaria.isPending}>{crearBancaria.isPending ? 'Creando…' : 'Crear cuenta'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RegistrarMovimientoBancarioDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const cuentas = useCuentasBancarias();
  const registrarMov = useRegistrarMovimiento();
  const [cuentaId, setCuentaId] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<'abono' | 'cargo'>('abono');
  const [monto, setMonto] = useState('');

  React.useEffect(() => {
    if (open) { setCuentaId(''); setFecha(new Date().toISOString().slice(0, 10)); setDescripcion(''); setTipo('abono'); setMonto(''); }
  }, [open]);

  async function registrar() {
    if (!cuentaId) { toast.error('Seleccione una cuenta'); return; }
    if (!descripcion.trim()) { toast.error('Ingrese la descripción'); return; }
    const n = Number(monto);
    if (!n || n <= 0) { toast.error('Ingrese un monto válido'); return; }
    try {
      await registrarMov.mutateAsync({
        cuentaId,
        fecha,
        descripcion: descripcion.trim(),
        monto: tipo === 'abono' ? n : -n,
      });
      toast.success('Movimiento registrado');
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al registrar');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar movimiento bancario</DialogTitle></DialogHeader>
        {cuentas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Primero crea una cuenta bancaria.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Cuenta</Label>
              <select className={selectClass} value={cuentaId} onChange={(e) => setCuentaId(e.target.value)}>
                <option value="">— Seleccionar —</option>
                {cuentas.map((c) => <option key={c.id} value={c.id}>{c.banco} · {c.numero}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="mb-fecha">Fecha</Label><Input id="mb-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1" /></div>
              <div>
                <Label>Tipo</Label>
                <select className={selectClass} value={tipo} onChange={(e) => setTipo(e.target.value as 'abono' | 'cargo')}>
                  <option value="abono">Abono (+)</option><option value="cargo">Cargo (−)</option>
                </select>
              </div>
            </div>
            <div><Label htmlFor="mb-desc">Descripción</Label><Input id="mb-desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="mb-monto">Monto (CLP)</Label><Input id="mb-monto" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" className="mt-1" /></div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={registrar} disabled={registrarMov.isPending || cuentas.length === 0}>{registrarMov.isPending ? 'Registrando…' : 'Registrar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
