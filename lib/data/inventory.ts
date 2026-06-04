'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Producto, MovimientoStock, EstadoStock } from '@/types';

// ── Pure helpers ──────────────────────────────────────────────

export function calcEstado(disponible: number, minimo: number): EstadoStock {
  if (disponible <= 0) return 'sin_stock';
  if (minimo > 0 && disponible <= minimo) return 'bajo_minimo';
  return 'ok';
}

// ── Query Keys ────────────────────────────────────────────────

const KEYS = {
  productos: ['productos'] as const,
  producto: (id: string) => ['productos', id] as const,
  movimientos: ['movimientos'] as const,
  movimientosByProducto: (id: string) => ['movimientos', id] as const,
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ── List hooks ────────────────────────────────────────────────

export function useProductos(): Producto[] {
  const { data = [] } = useQuery<Producto[]>({
    queryKey: KEYS.productos,
    queryFn: () => fetchJson<Producto[]>('/api/productos'),
  });
  return data;
}

export function useMovimientos(): MovimientoStock[] {
  const { data = [] } = useQuery<MovimientoStock[]>({
    queryKey: KEYS.movimientos,
    queryFn: () => fetchJson<MovimientoStock[]>('/api/movimientos'),
  });
  return data;
}

export function useMovimientosByProducto(productoId: string | undefined): MovimientoStock[] {
  const { data = [] } = useQuery<MovimientoStock[]>({
    queryKey: KEYS.movimientosByProducto(productoId ?? ''),
    queryFn: () => fetchJson<MovimientoStock[]>(`/api/movimientos?productoId=${productoId}`),
    enabled: !!productoId,
  });
  return data;
}

// ── Single-item hook ──────────────────────────────────────────

export function useProducto(id: string | undefined): Producto | undefined {
  const { data } = useQuery<Producto>({
    queryKey: KEYS.producto(id ?? ''),
    queryFn: () => fetchJson<Producto>(`/api/productos/${id}`),
    enabled: !!id,
  });
  return data;
}

// ── Mutation: crear producto ──────────────────────────────────

interface CrearProductoInput {
  sku: string;
  nombre: string;
  categoria: string;
  precioVenta: number;
  costoPMP: number;
  stockDisponible: number;
  stockMinimo: number;
  unidad: string;
}

export function useCrearProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CrearProductoInput) => {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.productos });
      qc.invalidateQueries({ queryKey: KEYS.movimientos });
    },
  });
}

// ── Mutation: ajustar stock ───────────────────────────────────

interface AjustarStockInput {
  productoId: string;
  tipo: MovimientoStock['tipo'];
  cantidad: number;
  motivo?: string;
  usuario: string;
}

export function useAjustarStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AjustarStockInput) => {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.productos });
      qc.invalidateQueries({ queryKey: KEYS.producto(vars.productoId) });
      qc.invalidateQueries({ queryKey: KEYS.movimientos });
      qc.invalidateQueries({ queryKey: KEYS.movimientosByProducto(vars.productoId) });
    },
  });
}
