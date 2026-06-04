import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Middleware de autenticación — server-side, reemplaza el AuthGuard client-side.
 * -------------------------------------------------------------------------
 * Mientras la DB de SQL Server no esté disponible, NextAuth no puede validar
 * credenciales, así que el login falla gracefully. El AuthGuard de Zustand
 * sigue activo como fallback client-side hasta que se complete el Sprint 2.7.
 *
 * Rutas protegidas: todo excepto /login, /registro, /onboarding, /api/auth/*, /api/health
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Aplica a todas las rutas EXCEPTO archivos estáticos y rutas de API de auth
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
