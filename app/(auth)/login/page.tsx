'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">Ampuero<span className="text-primary">ERP</span></h1>
            <p className="text-sm text-muted-foreground">ERP + CRM para Chile</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-base font-semibold">Iniciar sesión</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Correo electrónico</label>
              <Input placeholder="carlos@empresa.cl" defaultValue="carlos@losandes.cl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} defaultValue="demo1234" className="pr-10" />
                <button onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Link href="/dashboard">
              <Button className="w-full">Ingresar</Button>
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              ¿Olvidaste tu contraseña? <button className="text-primary hover:underline">Recuperar</button>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          ¿No tienes cuenta? <Link href="/registro" className="text-primary hover:underline">Registrarse</Link>
        </p>
      </div>
    </div>
  );
}
