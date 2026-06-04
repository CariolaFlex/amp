'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { oportunidadesCol } from '@/lib/data/crm';
import { useClientes, nombreCliente } from '@/lib/data/clientes';
import { useSession } from 'next-auth/react';
import type { EtapaPipeline } from '@/types';

const ETAPAS: { id: EtapaPipeline; label: string }[] = [
  { id: 'prospeccion', label: 'Prospección' },
  { id: 'calificado', label: 'Calificado' },
  { id: 'cotizacion_enviada', label: 'Cotización Enviada' },
  { id: 'negociacion', label: 'Negociación' },
  { id: 'ganada', label: 'Ganada' },
  { id: 'perdida', label: 'Perdida' },
];

const selectClass = 'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaults?: { titulo?: string; clienteNombre?: string; clienteRut?: string };
  onCreated?: (id: string) => void;
}

export function NuevaOportunidadDialog({ open, onOpenChange, defaults, onCreated }: Props) {
  const clientes = useClientes();
  const { data: session } = useSession();
  const user = session?.user;

  const [titulo, setTitulo] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clienteManual, setClienteManual] = useState({ nombre: '', rut: '' });
  const [monto, setMonto] = useState('');
  const [etapa, setEtapa] = useState<EtapaPipeline>('prospeccion');
  const [probabilidad, setProbabilidad] = useState('20');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  // resetear al abrir
  React.useEffect(() => {
    if (open) {
      setTitulo(defaults?.titulo ?? '');
      setClienteId('');
      setClienteManual({ nombre: defaults?.clienteNombre ?? '', rut: defaults?.clienteRut ?? '' });
      setMonto('');
      setEtapa('prospeccion');
      setProbabilidad('20');
      setNotas('');
    }
  }, [open, defaults]);

  async function handleCrear() {
    if (!titulo.trim()) { toast.error('Ingrese el título de la oportunidad'); return; }
    const cli = clientes.find((c) => c.id === clienteId);
    const clienteNombre = cli ? nombreCliente(cli) : clienteManual.nombre.trim();
    const clienteRut = cli ? (cli.rut ?? '') : clienteManual.rut.trim();
    if (!clienteNombre) { toast.error('Seleccione o ingrese el cliente'); return; }

    setSaving(true);
    const created = await oportunidadesCol.create({
      titulo: titulo.trim(),
      clienteNombre,
      clienteRut,
      monto: Number(monto) || 0,
      etapa,
      probabilidad: Math.max(0, Math.min(100, Number(probabilidad) || 0)),
      vendedorId: user?.id ?? '',
      vendedorNombre: user?.name ?? 'Sin asignar',
      ultimaActividad: new Date(),
      createdAt: new Date(),
      notas: notas.trim() || undefined,
    });
    toast.success('Oportunidad creada');
    setSaving(false);
    onOpenChange(false);
    onCreated?.(created.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva oportunidad</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="op-titulo">Título *</Label>
            <Input id="op-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Remodelación oficinas" className="mt-1" />
          </div>

          <div>
            <Label>Cliente</Label>
            {clientes.length > 0 ? (
              <select className={selectClass} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">— Seleccionar cliente —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{nombreCliente(c)}{c.rut ? ` · ${c.rut}` : ''}</option>
                ))}
              </select>
            ) : (
              <div className="mt-1 grid grid-cols-2 gap-2">
                <Input value={clienteManual.nombre} onChange={(e) => setClienteManual((s) => ({ ...s, nombre: e.target.value }))} placeholder="Nombre cliente" />
                <Input value={clienteManual.rut} onChange={(e) => setClienteManual((s) => ({ ...s, rut: e.target.value }))} placeholder="RUT" className="font-mono" />
              </div>
            )}
            {clientes.length === 0 && <p className="mt-1 text-xs text-muted-foreground">No hay clientes registrados; ingresa el dato manualmente o créalo en Clientes.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="op-monto">Monto (CLP)</Label>
              <Input id="op-monto" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="op-prob">Probabilidad %</Label>
              <Input id="op-prob" type="number" min={0} max={100} value={probabilidad} onChange={(e) => setProbabilidad(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Etapa</Label>
            <select className={selectClass} value={etapa} onChange={(e) => setEtapa(e.target.value as EtapaPipeline)}>
              {ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="op-notas">Notas</Label>
            <textarea id="op-notas" value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm" placeholder="Detalles, contexto…" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCrear} disabled={saving}>{saving ? 'Creando…' : 'Crear oportunidad'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
