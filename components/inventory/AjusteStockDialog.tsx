'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { registrarMovimiento } from '@/lib/data/inventory';
import { useAuthStore } from '@/store/auth.store';
import type { Producto, MovimientoStock } from '@/types';

const selectClass = 'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm';

interface Props {
  producto: Producto | null;
  onClose: () => void;
}

export function AjusteStockDialog({ producto, onClose }: Props) {
  const user = useAuthStore((s) => s.getCurrentUser());
  const [tipo, setTipo] = useState<MovimientoStock['tipo']>('entrada');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (producto) { setTipo('entrada'); setCantidad(''); setMotivo(''); }
  }, [producto]);

  async function handleGuardar() {
    if (!producto) return;
    const n = Number(cantidad);
    if (!n || n === 0) { toast.error('Ingrese una cantidad distinta de 0'); return; }
    setSaving(true);
    await registrarMovimiento(producto, tipo, n, motivo, user?.nombre ?? 'Sistema');
    toast.success('Movimiento registrado');
    setSaving(false);
    onClose();
  }

  return (
    <Dialog open={!!producto} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Ajustar stock {producto ? `· ${producto.nombre}` : ''}</DialogTitle></DialogHeader>
        {producto && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Stock actual: <span className="font-medium text-foreground">{producto.stockDisponible} {producto.unidad}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <select className={selectClass} value={tipo} onChange={(e) => setTipo(e.target.value as MovimientoStock['tipo'])}>
                  <option value="entrada">Entrada (+)</option>
                  <option value="salida">Salida (−)</option>
                  <option value="ajuste">Ajuste (signo libre)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="aj-cant">Cantidad</Label>
                <Input id="aj-cant" type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder={tipo === 'ajuste' ? 'Ej: -5' : 'Ej: 100'} className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="aj-motivo">Motivo</Label>
              <Input id="aj-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: OC-2026-045, conteo físico…" className="mt-1" />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleGuardar} disabled={saving}>{saving ? 'Guardando…' : 'Registrar movimiento'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
