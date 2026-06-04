'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Building2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated' && !session?.user?.contexto) {
      router.replace('/seleccionar-contexto');
    }
  }, [status, session, router]);

  const autorizado = status === 'authenticated' && !!session?.user?.contexto;

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
