'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Check, Layers, Plus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ContextoSesion } from '@/types';

interface Plataforma { id: string; nombre: string; rut: string; }
interface CentroCosto { id: string; plataformaId: string; codigo: string; nombre: string; activo: boolean; }

export default function SeleccionarContextoPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
  const [centros, setCentros] = useState<CentroCosto[]>([]);
  const [plataformaId, setPlataformaId] = useState('');
  const [centroId, setCentroId] = useState('');
  const [nuevoCentro, setNuevoCentro] = useState('');
  const [loading, setLoading] = useState(false);

  // sin sesión → login
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  // cargar plataformas al tener sesión
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/plataformas')
      .then((r) => r.json())
      .then((data: Plataforma[]) => {
        setPlataformas(data);
        if (data.length > 0) setPlataformaId(data[0].id);
      })
      .catch(() => toast.error('Error al cargar plataformas'));
  }, [status]);

  // cargar centros al cambiar plataforma
  useEffect(() => {
    if (!plataformaId) return;
    setCentros([]);
    setCentroId('');
    fetch(`/api/plataformas/${plataformaId}/centroscosto`)
      .then((r) => r.json())
      .then((data: CentroCosto[]) => {
        setCentros(data);
        if (data.length > 0) setCentroId(data[0].id);
      })
      .catch(() => toast.error('Error al cargar centros de costo'));
  }, [plataformaId]);

  const handleAddCentro = async () => {
    if (!nuevoCentro.trim() || !plataformaId) return;
    const codigo = String(centros.length + 1).padStart(3, '0');
    const res = await fetch(`/api/plataformas/${plataformaId}/centroscosto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, nombre: nuevoCentro.trim() }),
    });
    if (!res.ok) { toast.error('Error al crear centro de costo'); return; }
    const centro: CentroCosto = await res.json();
    setCentros((prev) => [...prev, centro]);
    setCentroId(centro.id);
    setNuevoCentro('');
    toast.success('Centro de costo agregado');
  };

  const handleConfirm = async () => {
    if (!plataformaId || !centroId) {
      toast.error('Selecciona plataforma y centro de costo');
      return;
    }
    const plataforma = plataformas.find((p) => p.id === plataformaId);
    const centro = centros.find((c) => c.id === centroId);
    if (!plataforma || !centro) return;

    setLoading(true);
    const contexto: ContextoSesion = {
      plataformaId,
      plataformaNombre: plataforma.nombre,
      centroCostoId: centroId,
      centroCostoNombre: centro.nombre,
    };
    await update({ contexto });
    toast.success('Contexto seleccionado');
    router.replace('/dashboard');
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Cargando…
      </div>
    );
  }

  const nombre = session?.user?.name ?? 'Usuario';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6 py-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">Selecciona tu contexto</h1>
            <p className="text-sm text-muted-foreground">
              Hola {nombre.split(' ')[0]}, elige con qué plataforma y centro de costo trabajarás.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="h-4 w-4 text-muted-foreground" /> Plataforma
            </h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {plataformas.length === 0 && (
              <p className="text-sm text-muted-foreground py-2 text-center">Cargando…</p>
            )}
            {plataformas.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlataformaId(p.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                  plataformaId === p.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
                )}
              >
                <div>
                  <p className="text-sm font-medium">{p.nombre}</p>
                  <p className="font-mono text-xs text-muted-foreground">{p.rut}</p>
                </div>
                {plataformaId === p.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-sm font-semibold">Centro de costo</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {centros.map((c) => (
              <button
                key={c.id}
                onClick={() => setCentroId(c.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-colors',
                  centroId === c.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{c.codigo}</span>
                  <span className="text-sm">{c.nombre}</span>
                </div>
                {centroId === c.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}

            <div className="flex items-end gap-2 pt-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="nuevoCentro" className="text-xs text-muted-foreground">Agregar centro de costo</Label>
                <Input
                  id="nuevoCentro"
                  placeholder="Ej: Sucursal Coquimbo"
                  value={nuevoCentro}
                  onChange={(e) => setNuevoCentro(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCentro())}
                />
              </div>
              <Button type="button" variant="outline" size="icon" onClick={handleAddCentro} disabled={!nuevoCentro.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-muted-foreground" onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="mr-2 h-4 w-4" /> Salir
          </Button>
          <Button className="flex-1" onClick={handleConfirm} disabled={!plataformaId || !centroId || loading}>
            {loading ? 'Entrando…' : 'Entrar al sistema'}
          </Button>
        </div>
      </div>
    </div>
  );
}
