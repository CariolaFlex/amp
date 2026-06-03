'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Check, Layers, Plus, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SeleccionarContextoPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const cuentas = useAuthStore((s) => s.cuentas);
  const plataformasAll = useAuthStore((s) => s.plataformas);
  const centrosAll = useAuthStore((s) => s.centrosCosto);
  const addCentroCosto = useAuthStore((s) => s.addCentroCosto);
  const setContexto = useAuthStore((s) => s.setContexto);
  const logout = useAuthStore((s) => s.logout);

  const [plataformaId, setPlataformaId] = useState<string>('');
  const [centroId, setCentroId] = useState<string>('');
  const [nuevoCentro, setNuevoCentro] = useState('');

  const user = useMemo(
    () => cuentas.find((c) => c.id === currentUserId) ?? null,
    [cuentas, currentUserId],
  );
  const plataformas = useMemo(
    () => (user ? plataformasAll.filter((p) => p.empresaId === user.empresaId) : []),
    [plataformasAll, user],
  );
  const centros = useMemo(
    () => (plataformaId ? centrosAll.filter((c) => c.plataformaId === plataformaId && c.activo) : []),
    [centrosAll, plataformaId],
  );

  // sin sesión → login
  useEffect(() => {
    if (hydrated && !user) router.replace('/login');
  }, [hydrated, user, router]);

  // preseleccionar primera plataforma
  useEffect(() => {
    if (!plataformaId && plataformas.length > 0) setPlataformaId(plataformas[0].id);
  }, [plataformas, plataformaId]);

  // preseleccionar primer centro al cambiar de plataforma
  useEffect(() => {
    setCentroId(centros[0]?.id ?? '');
  }, [plataformaId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddCentro = () => {
    if (!nuevoCentro.trim() || !plataformaId) return;
    const codigo = String(centros.length + 1).padStart(3, '0');
    const centro = addCentroCosto(plataformaId, codigo, nuevoCentro.trim());
    setCentroId(centro.id);
    setNuevoCentro('');
    toast.success('Centro de costo agregado');
  };

  const handleConfirm = () => {
    if (!plataformaId || !centroId) {
      toast.error('Selecciona plataforma y centro de costo');
      return;
    }
    const res = setContexto(plataformaId, centroId);
    if (res.ok) {
      router.replace('/dashboard');
    } else {
      toast.error(res.error);
    }
  };

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Cargando…
      </div>
    );
  }

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
              Hola {user.nombre.split(' ')[0]}, elige con qué plataforma y centro de costo trabajarás.
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
          <Button variant="ghost" className="text-muted-foreground" onClick={() => { logout(); router.replace('/login'); }}>
            <LogOut className="mr-2 h-4 w-4" /> Salir
          </Button>
          <Button className="flex-1" onClick={handleConfirm} disabled={!plataformaId || !centroId}>
            Entrar al sistema
          </Button>
        </div>
      </div>
    </div>
  );
}
