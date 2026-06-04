'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AsientoContable } from '@/types';

export interface LineaAsiento {
  cuentaCodigo: string;
  cuentaNombre: string;
  debe: number;
  haber: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export function useAsientos(periodo?: string): AsientoContable[] {
  const url = periodo ? `/api/asientos?periodo=${periodo}` : '/api/asientos';
  const { data = [] } = useQuery<AsientoContable[]>({
    queryKey: periodo ? ['asientos', periodo] : ['asientos'],
    queryFn: () => fetchJson<AsientoContable[]>(url),
  });
  return data;
}

interface CrearAsientoInput {
  fecha: string;
  glosa: string;
  lineas: LineaAsiento[];
}

export function useCrearAsiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CrearAsientoInput) => {
      const res = await fetch('/api/asientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ numero: number }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['asientos'] }),
  });
}
