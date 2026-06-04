import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

/**
 * Configuración de NextAuth v5.
 * -------------------------------------------------------------------------
 * Fase actual: el Credentials provider valida contra SQL Server via
 * getPool() + sp_usuarios_login. Si la DB no está disponible, retorna null
 * (login falla con mensaje genérico) sin crashear la app.
 *
 * Cuando Carlos entregue los scripts SQL:
 * 1. Ejecutar los scripts en SSMS
 * 2. Actualizar MSSQL_PASSWORD en .env.local
 * 3. El login empezará a funcionar contra la DB real
 */

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    /**
     * Controla qué rutas están protegidas.
     * middleware.ts llama a este callback en cada request.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/login') ||
                         nextUrl.pathname.startsWith('/registro') ||
                         nextUrl.pathname.startsWith('/onboarding');
      const isApiAuth = nextUrl.pathname.startsWith('/api/auth');
      const isApiHealth = nextUrl.pathname.startsWith('/api/health');

      // Rutas públicas siempre permitidas
      if (isAuthPage || isApiAuth || isApiHealth) return true;

      // Todo lo demás requiere sesión
      if (!isLoggedIn) return false;

      return true;
    },

    /** Agrega campos custom al JWT (rol, empresaId, contexto) */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = (user as { rol?: string }).rol;
        token.empresaId = (user as { empresaId?: string }).empresaId;
      }
      return token;
    },

    /** Expone campos del JWT en session.user (accesible via useSession) */
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { rol?: string }).rol = token.rol as string;
        (session.user as { empresaId?: string }).empresaId = token.empresaId as string;
      }
      return session;
    },
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },

      async authorize(credentials) {
        // Validación de formato
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        try {
          // ── Conectar a SQL Server ─────────────────────────────────────
          // Este bloque se activa cuando Carlos entregue los scripts SQL.
          // Por ahora getPool() fallará si no hay DB → catch → null.
          const { getPool, sql } = await import('@/lib/db/mssql');
          const pool = await getPool();

          const result = await pool
            .request()
            .input('email', sql.VarChar(255), email.toLowerCase())
            .execute('sp_usuarios_login');

          const row = result.recordset[0] as {
            id: string;
            nombre: string;
            email: string;
            passwordHash: string;
            rol: string;
            empresaId: string;
            activo: boolean;
          } | undefined;

          if (!row || !row.activo) return null;

          const passwordMatch = await bcrypt.compare(password, row.passwordHash);
          if (!passwordMatch) return null;

          return {
            id: row.id,
            name: row.nombre,
            email: row.email,
            rol: row.rol,
            empresaId: row.empresaId,
          };
        } catch {
          // DB no disponible aún → login falla silenciosamente
          // (no crashea la app, el usuario ve "credenciales inválidas")
          return null;
        }
      },
    }),
  ],
};
