import type { DefaultSession } from 'next-auth';
import type { ContextoSesion } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      rol: string;
      empresaId: string;
      contexto?: ContextoSesion;
    } & DefaultSession['user'];
  }

  interface User {
    rol?: string;
    empresaId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    rol?: string;
    empresaId?: string;
    contexto?: ContextoSesion;
  }
}
