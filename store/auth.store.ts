'use client';

/**
 * Store de autenticación y contexto operativo.
 * -------------------------------------------------------------------------
 * Fase actual: cuentas/plataformas/centros viven en localStorage (persist).
 * SQL-ready: `register`/`login` se reemplazan luego por llamadas a
 * `/api/auth/*`; la forma del estado (currentUser, contexto) no cambia, así
 * que el guard y la UI siguen igual.
 *
 * NOTA: la password se guarda en claro SÓLO para el demo local. Al conectar
 * el backend, la validación ocurre en el servidor y nunca se persiste aquí.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CuentaUsuario,
  Plataforma,
  CentroCosto,
  ContextoSesion,
} from '@/types';
import { genId } from '@/lib/data/collection';

interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
  empresaNombre: string;
  empresaRut: string;
  giro?: string;
}

type Result = { ok: true } | { ok: false; error: string };

interface AuthState {
  cuentas: CuentaUsuario[];
  plataformas: Plataforma[];
  centrosCosto: CentroCosto[];

  currentUserId: string | null;
  contexto: ContextoSesion | null;
  hydrated: boolean;

  register: (input: RegisterInput) => Result;
  login: (email: string, password: string) => Result;
  logout: () => void;
  setContexto: (plataformaId: string, centroCostoId: string) => Result;
  addCentroCosto: (plataformaId: string, codigo: string, nombre: string) => CentroCosto;

  getCurrentUser: () => CuentaUsuario | null;
  plataformasDeUsuario: () => Plataforma[];
  centrosDePlataforma: (plataformaId: string) => CentroCosto[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      cuentas: [],
      plataformas: [],
      centrosCosto: [],
      currentUserId: null,
      contexto: null,
      hydrated: false,

      register: ({ nombre, email, password, empresaNombre, empresaRut, giro }) => {
        const emailNorm = email.trim().toLowerCase();
        if (get().cuentas.some((c) => c.email.toLowerCase() === emailNorm)) {
          return { ok: false, error: 'Ya existe una cuenta con ese correo' };
        }
        const empresaId = genId('emp');
        const plataforma: Plataforma = {
          id: genId('plt'),
          empresaId,
          nombre: empresaNombre.trim(),
          rut: empresaRut.trim(),
        };
        const centro: CentroCosto = {
          id: genId('cc'),
          plataformaId: plataforma.id,
          codigo: '001',
          nombre: 'Casa Matriz',
          activo: true,
        };
        const cuenta: CuentaUsuario = {
          id: genId('usr'),
          nombre: nombre.trim(),
          email: emailNorm,
          rol: 'owner',
          empresaId,
          password,
          activo: true,
          fechaAlta: new Date(),
        };
        set((s) => ({
          cuentas: [...s.cuentas, cuenta],
          plataformas: [...s.plataformas, plataforma],
          centrosCosto: [...s.centrosCosto, centro],
          currentUserId: cuenta.id,
          contexto: null,
        }));
        return { ok: true };
      },

      login: (email, password) => {
        const emailNorm = email.trim().toLowerCase();
        const cuenta = get().cuentas.find((c) => c.email.toLowerCase() === emailNorm);
        if (!cuenta) return { ok: false, error: 'No existe una cuenta con ese correo' };
        if (cuenta.password !== password) return { ok: false, error: 'Contraseña incorrecta' };
        if (!cuenta.activo) return { ok: false, error: 'Cuenta desactivada' };
        set({ currentUserId: cuenta.id, contexto: null });
        return { ok: true };
      },

      logout: () => set({ currentUserId: null, contexto: null }),

      setContexto: (plataformaId, centroCostoId) => {
        const plataforma = get().plataformas.find((p) => p.id === plataformaId);
        const centro = get().centrosCosto.find((c) => c.id === centroCostoId);
        if (!plataforma || !centro) return { ok: false, error: 'Contexto inválido' };
        set({
          contexto: {
            plataformaId,
            plataformaNombre: plataforma.nombre,
            centroCostoId,
            centroCostoNombre: centro.nombre,
          },
        });
        return { ok: true };
      },

      addCentroCosto: (plataformaId, codigo, nombre) => {
        const centro: CentroCosto = {
          id: genId('cc'),
          plataformaId,
          codigo,
          nombre,
          activo: true,
        };
        set((s) => ({ centrosCosto: [...s.centrosCosto, centro] }));
        return centro;
      },

      getCurrentUser: () => {
        const { currentUserId, cuentas } = get();
        return cuentas.find((c) => c.id === currentUserId) ?? null;
      },

      plataformasDeUsuario: () => {
        const user = get().getCurrentUser();
        if (!user) return [];
        return get().plataformas.filter((p) => p.empresaId === user.empresaId);
      },

      centrosDePlataforma: (plataformaId) =>
        get().centrosCosto.filter((c) => c.plataformaId === plataformaId && c.activo),
    }),
    {
      name: 'amp:auth',
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
