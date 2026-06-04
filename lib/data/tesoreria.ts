'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { CuentaCobrar, CuentaPagar, BucketAging } from '@/types';

export function bucketAging(fechaVencimiento?: Date | string): BucketAging {
  if (!fechaVencimiento) return '0-30';
  const dias = Math.floor((Date.now() - new Date(fechaVencimiento).getTime()) / (24 * 3600 * 1000));
  if (dias <= 30) return '0-30';
  if (dias <= 60) return '31-60';
  if (dias <= 90) return '61-90';
  return '+90';
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

interface RawCxC {
  id: string;
  clienteNombre: string;
  clienteRut: string;
  folioDte: number;
  fechaEmision: string;
  fechaVencimiento: string;
  monto: number;
  saldo: number;
  estado: string;
}

interface RawCxP {
  id: string;
  proveedorNombre: string;
  proveedorRut: string;
  folioDte: number;
  fechaEmision: string;
  fechaVencimiento: string;
  monto: number;
  saldo: number;
  estado: string;
}

export function useCuentasCobrar(): CuentaCobrar[] {
  const { data = [] } = useQuery<RawCxC[]>({
    queryKey: ['cxc'],
    queryFn: () => fetchJson<RawCxC[]>('/api/cxc'),
  });
  return useMemo(
    () =>
      data
        .filter((r) => r.estado !== 'pagada')
        .map((r) => ({
          id: r.id,
          clienteNombre: r.clienteNombre,
          clienteRut: r.clienteRut,
          folioDte: Number(r.folioDte),
          fechaEmision: new Date(r.fechaEmision),
          fechaVencimiento: new Date(r.fechaVencimiento),
          monto: Number(r.monto),
          saldo: Number(r.saldo),
          aging: bucketAging(r.fechaVencimiento),
        })),
    [data],
  );
}

export function useCuentasPagar(): CuentaPagar[] {
  const { data = [] } = useQuery<RawCxP[]>({
    queryKey: ['cxp'],
    queryFn: () => fetchJson<RawCxP[]>('/api/cxp'),
  });
  return useMemo(
    () =>
      data
        .filter((r) => r.estado !== 'pagada')
        .map((r) => ({
          id: r.id,
          proveedorNombre: r.proveedorNombre,
          proveedorRut: r.proveedorRut,
          folioDte: Number(r.folioDte),
          fechaEmision: new Date(r.fechaEmision),
          fechaVencimiento: new Date(r.fechaVencimiento),
          monto: Number(r.monto),
          saldo: Number(r.saldo),
        })),
    [data],
  );
}
