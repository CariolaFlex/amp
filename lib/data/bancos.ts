'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { CuentaBancaria, MovimientoBancario } from '@/types';

const KEYS = {
  bancos: ['bancos'] as const,
  movimientos: ['bancos', 'movimientos'] as const,
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export function useCuentasBancarias(): CuentaBancaria[] {
  const { data = [] } = useQuery<CuentaBancaria[]>({
    queryKey: KEYS.bancos,
    queryFn: () => fetchJson<CuentaBancaria[]>('/api/bancos'),
  });
  return data;
}

export function useMovimientosBancarios(): MovimientoBancario[] {
  const { data = [] } = useQuery<MovimientoBancario[]>({
    queryKey: KEYS.movimientos,
    queryFn: () => fetchJson<MovimientoBancario[]>('/api/bancos/movimientos'),
  });
  return data;
}

export function useMovimientosByCuenta(cuentaId: string | undefined): MovimientoBancario[] {
  const all = useMovimientosBancarios();
  return useMemo(() => (cuentaId ? all.filter((m) => m.cuentaId === cuentaId) : []), [all, cuentaId]);
}

interface CrearBancariaInput { banco: string; numero?: string; tipo?: string; saldo?: number; }

export function useCrearBancaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CrearBancariaInput) => {
      const res = await fetch('/api/bancos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.bancos }),
  });
}

interface RegistrarMovimientoInput {
  cuentaId: string;
  fecha: string;
  descripcion: string;
  monto: number; // signed: positive=abono, negative=cargo
}

export function useRegistrarMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ cuentaId, ...body }: RegistrarMovimientoInput) => {
      const res = await fetch(`/api/bancos/${cuentaId}/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.bancos });
      qc.invalidateQueries({ queryKey: KEYS.movimientos });
    },
  });
}
