'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatRut, validateRut } from '@/lib/utils/rut';
import { toast } from 'sonner';

export default function RegistroPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    empresaNombre: '',
    empresaRut: '',
    giro: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim() || !form.apellido.trim()) return setError('Ingresa nombre y apellido');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return setError('Correo inválido');
    if (form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres');
    if (!form.empresaNombre.trim()) return setError('Ingresa el nombre de la empresa');
    if (!form.empresaRut.trim() || !validateRut(form.empresaRut)) return setError('RUT de empresa inválido');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: `${form.nombre.trim()} ${form.apellido.trim()}`,
          email: form.email,
          password: form.password,
          empresaNombre: form.empresaNombre,
          empresaRut: form.empresaRut,
          giro: form.giro,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al crear la cuenta');
        setLoading(false);
        return;
      }

      const login = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (login?.ok) {
        toast.success('Cuenta creada');
        router.replace('/seleccionar-contexto');
      } else {
        setError('Cuenta creada pero no se pudo iniciar sesión. Intenta hacer login.');
        setLoading(false);
      }
    } catch {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 py-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">Ampuero<span className="text-primary">ERP</span></h1>
            <p className="text-sm text-muted-foreground">Crea tu cuenta y empresa</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-base font-semibold">Registro</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" placeholder="Carlos" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" placeholder="Ampuero" value={form.apellido} onChange={(e) => set('apellido', e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="carlos@empresa.cl" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => set('password', e.target.value)} />
              </div>

              <div className="border-t pt-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Datos de la empresa</p>
                <div className="space-y-1.5">
                  <Label htmlFor="empresaNombre">Razón social / Nombre</Label>
                  <Input id="empresaNombre" placeholder="Constructora Los Andes SpA" value={form.empresaNombre} onChange={(e) => set('empresaNombre', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="empresaRut">RUT empresa</Label>
                    <Input id="empresaRut" className="font-mono" placeholder="76.123.456-7" value={form.empresaRut} onChange={(e) => set('empresaRut', formatRut(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="giro">Giro</Label>
                    <Input id="giro" placeholder="Construcción" value={form.giro} onChange={(e) => set('giro', e.target.value)} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando…' : 'Crear cuenta y empresa'}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Iniciar sesión</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
