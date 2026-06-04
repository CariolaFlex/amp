'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Proveedor, OrdenCompra, DteProveedor } from '@/types';

// ── Query Keys ────────────────────────────────────────────────

const KEYS = {
  proveedores: ['proveedores'] as const,
  proveedor: (id: string) => ['proveedores', id] as const,
  ordenes: ['ordenes-compra'] as const,
  dtesProveedor: ['dtes-proveedor'] as const,
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ── List hooks ────────────────────────────────────────────────

export function useProveedores(): Proveedor[] {
  const { data = [] } = useQuery<Proveedor[]>({
    queryKey: KEYS.proveedores,
    queryFn: () => fetchJson<Proveedor[]>('/api/proveedores'),
  });
  return data;
}

export function useOrdenesCompra(): OrdenCompra[] {
  const { data = [] } = useQuery<OrdenCompra[]>({
    queryKey: KEYS.ordenes,
    queryFn: () => fetchJson<OrdenCompra[]>('/api/ordenes-compra'),
  });
  return data;
}

export function useDtesProveedor(): DteProveedor[] {
  const { data = [] } = useQuery<DteProveedor[]>({
    queryKey: KEYS.dtesProveedor,
    queryFn: () => fetchJson<DteProveedor[]>('/api/dtes-proveedor'),
  });
  return data;
}

// ── Single-item and filtered hooks ───────────────────────────

export function useProveedor(id: string | undefined): Proveedor | undefined {
  const { data } = useQuery<Proveedor>({
    queryKey: KEYS.proveedor(id ?? ''),
    queryFn: () => fetchJson<Proveedor>(`/api/proveedores/${id}`),
    enabled: !!id,
  });
  return data;
}

export function useOrdenesByProveedorRut(rut: string | undefined): OrdenCompra[] {
  const ocs = useOrdenesCompra();
  return useMemo(() => (rut ? ocs.filter((o) => o.proveedorRut === rut) : []), [ocs, rut]);
}

export function useDtesByProveedorRut(rut: string | undefined): DteProveedor[] {
  const dps = useDtesProveedor();
  return useMemo(() => (rut ? dps.filter((d) => d.proveedorRut === rut) : []), [dps, rut]);
}

// ── Mutation: crear proveedor ─────────────────────────────────

interface CrearProveedorInput {
  rut?: string;
  razonSocial: string;
  giro?: string;
  contactoNombre?: string;
  contactoEmail?: string;
  contactoTelefono?: string;
  condicionPago?: string;
}

export function useCrearProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CrearProveedorInput) => {
      const res = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.proveedores }),
  });
}

// ── Mutation: crear OC ────────────────────────────────────────

interface CrearOCInput {
  proveedorId: string;
  proveedorRut: string;
  proveedorNombre: string;
  total: number;
}

export function useCrearOC() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CrearOCInput) => {
      const res = await fetch('/api/ordenes-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: string; numero: string }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.ordenes }),
  });
}

// ── Mutation: registrar DTE proveedor ────────────────────────

interface CrearDteProveedorInput {
  proveedorId: string;
  proveedorRut: string;
  proveedorNombre: string;
  folio: number;
  total: number;
  ordenCompraId?: string;
}

export function useCrearDteProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CrearDteProveedorInput) => {
      const res = await fetch('/api/dtes-proveedor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dtesProveedor }),
  });
}

// ── Mutation: acusar DTE proveedor ───────────────────────────

export function useAcusarDte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, accion }: { id: string; accion: DteProveedor['estado'] }) => {
      const res = await fetch(`/api/dtes-proveedor/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dtesProveedor }),
  });
}
