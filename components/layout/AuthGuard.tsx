'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Building2 } from 'lucide-react';

/**
 * Protege las rutas del dashboard:
 *  - sin sesión        → /login
 *  - sesión sin contexto (plataforma/centro de costo) → /seleccionar-contexto
 * Espera a la rehidratación de localStorage para no redirigir en falso.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const contexto = useAuthStore((s) => s.contexto);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!currentUserId) {
      router.replace('/login');
    } else if (!contexto) {
      router.replace('/seleccionar-contexto');
    }
  }, [hydrated, currentUserId, contexto, router]);

  const autorizado = hydrated && currentUserId && contexto;

  if (!autorizado) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex h-11 w-11 animate-pulse items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-sm">Cargando sesión…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
