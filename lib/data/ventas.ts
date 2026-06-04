'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Cotizacion, OrdenVenta, Dte, LineaDte, TipoDte, EstadoCotizacion } from '@/types';

// ── Helpers ──────────────────────────────────────────────────

/** IVA aplica a Factura Afecta (33) y Boleta (39). */
export function aplicaIva(tipo: TipoDte): boolean {
  return tipo === 33 || tipo === 39;
}

export function calcTotales(lineas: LineaDte[], tipo: TipoDte) {
  const neto = lineas.reduce((s, l) => s + l.total, 0);
  const iva = aplicaIva(tipo) ? Math.round(neto * 0.19) : 0;
  return { neto, iva, total: neto + iva };
}

// ── Query Keys ────────────────────────────────────────────────

const KEYS = {
  cotizaciones: ['cotizaciones'] as const,
  cotizacion: (id: string) => ['cotizaciones', id] as const,
  ordenes: ['ordenes-venta'] as const,
  orden: (id: string) => ['ordenes-venta', id] as const,
  dtes: ['dtes'] as const,
  dte: (id: string) => ['dtes', id] as const,
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ── List hooks ────────────────────────────────────────────────

export function useCotizaciones() {
  const { data = [] } = useQuery<Cotizacion[]>({
    queryKey: KEYS.cotizaciones,
    queryFn: () => fetchJson<Cotizacion[]>('/api/cotizaciones'),
  });
  return data;
}

export function useOrdenesVenta() {
  const { data = [] } = useQuery<OrdenVenta[]>({
    queryKey: KEYS.ordenes,
    queryFn: () => fetchJson<OrdenVenta[]>('/api/ordenes-venta'),
  });
  return data;
}

export function useDtes() {
  const { data = [] } = useQuery<Dte[]>({
    queryKey: KEYS.dtes,
    queryFn: () => fetchJson<Dte[]>('/api/dtes'),
  });
  return data;
}

// ── Single-item hooks ─────────────────────────────────────────

export function useCotizacion(id: string | undefined) {
  const { data } = useQuery<Cotizacion>({
    queryKey: KEYS.cotizacion(id ?? ''),
    queryFn: () => fetchJson<Cotizacion>(`/api/cotizaciones/${id}`),
    enabled: !!id,
  });
  return data;
}

export function useOrdenVenta(id: string | undefined) {
  const { data } = useQuery<OrdenVenta>({
    queryKey: KEYS.orden(id ?? ''),
    queryFn: () => fetchJson<OrdenVenta>(`/api/ordenes-venta/${id}`),
    enabled: !!id,
  });
  return data;
}

export function useDte(id: string | undefined) {
  const { data } = useQuery<Dte>({
    queryKey: KEYS.dte(id ?? ''),
    queryFn: () => fetchJson<Dte>(`/api/dtes/${id}`),
    enabled: !!id,
  });
  return data;
}

// ── Mutation: crear cotización ────────────────────────────────

interface CrearCotizacionInput {
  clienteId?: string;
  clienteNombre: string;
  clienteRut: string;
  tipoDte: TipoDte;
  condicionPago?: string;
  lineas: LineaDte[];
  neto: number;
  iva: number;
  total: number;
  notas?: string;
  estado: EstadoCotizacion;
  vendedorId?: string;
  vendedorNombre?: string;
}

export function useCrearCotizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CrearCotizacionInput) => {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: string; numero: string }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.cotizaciones }),
  });
}

// ── Mutation: actualizar cotización ──────────────────────────

interface ActualizarCotizacionInput {
  tipoDte?: TipoDte;
  clienteId?: string;
  clienteNombre?: string;
  clienteRut?: string;
  condicionPago?: string;
  lineas?: LineaDte[];
  neto?: number;
  iva?: number;
  total?: number;
  notas?: string;
  estado?: EstadoCotizacion;
}

export function useActualizarCotizacion(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ActualizarCotizacionInput) => {
      const res = await fetch(`/api/cotizaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.cotizaciones });
      qc.invalidateQueries({ queryKey: KEYS.cotizacion(id) });
    },
  });
}

// ── Mutation: aprobar / rechazar cotización ───────────────────

export function useAprobarCotizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cotizaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'aprobada' }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.cotizaciones }),
  });
}

export function useRechazarCotizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cotizaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'rechazada' }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.cotizaciones }),
  });
}

// ── Mutation: convertir cotización → OV ──────────────────────

export function useConvertirAOV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cotizacionId: string) => {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}/convertir`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<OrdenVenta>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.cotizaciones });
      qc.invalidateQueries({ queryKey: KEYS.ordenes });
    },
  });
}

// ── Mutation: emitir DTE desde OV ────────────────────────────

export function useEmitirDte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ovId: string) => {
      const res = await fetch(`/api/ordenes-venta/${ovId}/emitir`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<Dte>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.ordenes });
      qc.invalidateQueries({ queryKey: KEYS.dtes });
    },
  });
}

// ── Mutation: anular OV ───────────────────────────────────────

export function useAnularOV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ovId: string) => {
      const res = await fetch(`/api/ordenes-venta/${ovId}/anular`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.ordenes });
      qc.invalidateQueries({ queryKey: KEYS.cotizaciones });
      qc.invalidateQueries({ queryKey: KEYS.dtes });
    },
  });
}

// ── Mutation: marcar DTE pagado / anular DTE ─────────────────

export function useMarcarDtePagado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dtes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pagar' }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: KEYS.dtes });
      qc.invalidateQueries({ queryKey: KEYS.dte(id) });
    },
  });
}

export function useAnularDte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dtes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'anular' }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: KEYS.dtes });
      qc.invalidateQueries({ queryKey: KEYS.dte(id) });
    },
  });
}
