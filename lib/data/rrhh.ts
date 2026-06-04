'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Empleado, BHE, TipoContrato } from '@/types';

const KEYS = {
  empleados: ['empleados'] as const,
  bhe: ['bhe'] as const,
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export function useEmpleados(): Empleado[] {
  const { data = [] } = useQuery<Empleado[]>({
    queryKey: KEYS.empleados,
    queryFn: () => fetchJson<Empleado[]>('/api/empleados'),
  });
  return data;
}

export function useBhe(): BHE[] {
  const { data = [] } = useQuery<BHE[]>({
    queryKey: KEYS.bhe,
    queryFn: () => fetchJson<BHE[]>('/api/bhe'),
  });
  return data;
}

interface CrearEmpleadoInput {
  rut?: string;
  nombre: string;
  cargo?: string;
  contrato?: TipoContrato;
  banco?: string;
  numeroCuenta?: string;
  sueldoBase?: number;
  fechaIngreso?: string;
}

export function useCrearEmpleado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CrearEmpleadoInput) => {
      const res = await fetch('/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.empleados }),
  });
}

interface CrearBHEInput {
  rut?: string;
  nombre: string;
  periodo: string;
  montoBruto: number;
}

export function useCrearBHE() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CrearBHEInput) => {
      const res = await fetch('/api/bhe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.bhe }),
  });
}
