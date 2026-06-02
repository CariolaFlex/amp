'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { formatRut } from '@/lib/utils/rut';

export default function RegistroPage() {
  const [rut, setRut] = useState('');
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">Ampuero<span className="text-primary">ERP</span></h1>
            <p className="text-sm text-muted-foreground">Crea tu cuenta gratuita</p>
          </div>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-base font-semibold">Registro</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                <Input placeholder="Carlos" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Apellido</label>
                <Input placeholder="Ampuero" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">RUT personal</label>
              <Input value={rut} onChange={e => setRut(formatRut(e.target.value))} placeholder="12.345.678-9" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Correo electrónico</label>
              <Input type="email" placeholder="carlos@empresa.cl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
              <Input type="password" placeholder="Mínimo 8 caracteres" />
            </div>
            <Link href="/onboarding">
              <Button className="w-full">Crear cuenta y configurar empresa</Button>
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Iniciar sesión</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
