'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { useCrearAsiento, type LineaAsiento } from '@/lib/data/contabilidad';
import { formatCLP } from '@/lib/utils/clp';

interface LineaEdit extends LineaAsiento { _id: string; }
let _seq = 0;
const nueva = (): LineaEdit => ({ _id: String(++_seq), cuentaCodigo: '', cuentaNombre: '', debe: 0, haber: 0 });

export function NuevoAsientoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [glosa, setGlosa] = useState('');
  const [lineas, setLineas] = useState<LineaEdit[]>([nueva(), nueva()]);
  const crearAsiento = useCrearAsiento();

  React.useEffect(() => {
    if (open) { setFecha(new Date().toISOString().slice(0, 10)); setGlosa(''); setLineas([nueva(), nueva()]); }
  }, [open]);

  const totalDebe = lineas.reduce((s, l) => s + (Number(l.debe) || 0), 0);
  const totalHaber = lineas.reduce((s, l) => s + (Number(l.haber) || 0), 0);
  const balanceado = totalDebe === totalHaber && totalDebe > 0;

  const upd = (id: string, field: keyof LineaEdit, value: string | number) =>
    setLineas((p) => p.map((l) => (l._id === id ? { ...l, [field]: value } : l)));

  async function guardar() {
    if (!glosa.trim()) { toast.error('Ingrese la glosa'); return; }
    if (!balanceado) { toast.error('El asiento debe estar balanceado (Debe = Haber)'); return; }
    const validas = lineas.filter((l) => l.cuentaCodigo.trim() && (l.debe > 0 || l.haber > 0));
    if (validas.length < 2) { toast.error('Ingrese al menos dos líneas con cuenta y monto'); return; }
    try {
      await crearAsiento.mutateAsync({
        fecha,
        glosa: glosa.trim(),
        lineas: validas.map(({ cuentaCodigo, cuentaNombre, debe, haber }) => ({
          cuentaCodigo, cuentaNombre, debe: Number(debe) || 0, haber: Number(haber) || 0,
        })),
      });
      toast.success('Asiento registrado');
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Nuevo asiento contable</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="as-fecha">Fecha</Label><Input id="as-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="as-glosa">Glosa</Label><Input id="as-glosa" value={glosa} onChange={(e) => setGlosa(e.target.value)} placeholder="Descripción del asiento" className="mt-1" /></div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium text-muted-foreground">
              <span className="col-span-2">Cuenta</span>
              <span className="col-span-5">Nombre cuenta</span>
              <span className="col-span-2 text-right">Debe</span>
              <span className="col-span-2 text-right">Haber</span>
              <span className="col-span-1" />
            </div>
            {lineas.map((l) => (
              <div key={l._id} className="grid grid-cols-12 items-center gap-2">
                <Input className="col-span-2 h-8 font-mono text-xs" value={l.cuentaCodigo} onChange={(e) => upd(l._id, 'cuentaCodigo', e.target.value)} placeholder="1110001" />
                <Input className="col-span-5 h-8 text-xs" value={l.cuentaNombre} onChange={(e) => upd(l._id, 'cuentaNombre', e.target.value)} placeholder="Nombre de la cuenta" />
                <Input className="col-span-2 h-8 text-right text-xs" type="number" value={l.debe || ''} onChange={(e) => upd(l._id, 'debe', Number(e.target.value))} placeholder="0" />
                <Input className="col-span-2 h-8 text-right text-xs" type="number" value={l.haber || ''} onChange={(e) => upd(l._id, 'haber', Number(e.target.value))} placeholder="0" />
                <button className="col-span-1 flex justify-end text-muted-foreground hover:text-destructive" onClick={() => setLineas((p) => p.filter((x) => x._id !== l._id))}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setLineas((p) => [...p, nueva()])}><Plus className="mr-1 h-3.5 w-3.5" />Agregar línea</Button>
          </div>

          <div className="flex items-center justify-end gap-6 border-t pt-3 text-sm">
            <span className="text-muted-foreground">Debe: <span className="font-medium text-foreground">{formatCLP(totalDebe)}</span></span>
            <span className="text-muted-foreground">Haber: <span className="font-medium text-foreground">{formatCLP(totalHaber)}</span></span>
            <span className={balanceado ? 'font-medium text-success' : 'font-medium text-destructive'}>{balanceado ? 'Balanceado ✓' : `Descuadre: ${formatCLP(totalDebe - totalHaber)}`}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={guardar} disabled={crearAsiento.isPending || !balanceado}>{crearAsiento.isPending ? 'Guardando…' : 'Registrar asiento'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
