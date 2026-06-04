'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { EtapaPipeline, Oportunidad, Lead } from '@/types';

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

const PROB_POR_ETAPA: Record<EtapaPipeline, number> = {
  prospeccion: 20, calificado: 40, cotizacion_enviada: 55, negociacion: 70, ganada: 100, perdida: 0,
};

export function useOportunidades() {
  const { data = [] } = useQuery<Oportunidad[]>({
    queryKey: ['oportunidades'],
    queryFn: () => fetchJson('/api/oportunidades'),
  });
  return data;
}

export function useOportunidad(id: string | undefined) {
  const { data } = useQuery<Oportunidad>({
    queryKey: ['oportunidades', id],
    queryFn: () => fetchJson(`/api/oportunidades/${id}`),
    enabled: !!id,
  });
  return data ?? null;
}

export function useCrearOportunidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Oportunidad>) =>
      fetch('/api/oportunidades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oportunidades'] }),
  });
}

export function useActualizarOportunidad(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Oportunidad>) =>
      fetch(`/api/oportunidades/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['oportunidades'] });
      qc.invalidateQueries({ queryKey: ['oportunidades', id] });
    },
  });
}

export async function setEtapaOportunidad(id: string, etapa: EtapaPipeline) {
  await fetch(`/api/oportunidades/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ etapa, probabilidad: PROB_POR_ETAPA[etapa] }),
  });
}

export function useLeads() {
  const { data = [] } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: () => fetchJson('/api/leads'),
  });
  return data;
}

export function useCrearLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Lead>) =>
      fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}
