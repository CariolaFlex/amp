'use client';

/** Acceso de datos de Compras: proveedores, órdenes de compra y DTE proveedor. */

import { useMemo } from 'react';
import { proveedoresCol, ordenesCompraCol, dtesProveedorCol } from './collections';
import { useCollection, useCollectionItem } from './collection';
import type { DteProveedor, OrdenCompra } from '@/types';

export { proveedoresCol, ordenesCompraCol, dtesProveedorCol };

export function useProveedores() { return useCollection(proveedoresCol); }
export function useOrdenesCompra() { return useCollection(ordenesCompraCol); }
export function useDtesProveedor() { return useCollection(dtesProveedorCol); }

export function useProveedor(id: string | undefined) { return useCollectionItem(proveedoresCol, id); }

export function useOrdenesByProveedorRut(rut: string | undefined) {
  const ocs = useOrdenesCompra();
  return useMemo(() => (rut ? ocs.filter((o) => o.proveedorRut === rut) : []), [ocs, rut]);
}

export function useDtesByProveedorRut(rut: string | undefined) {
  const dps = useDtesProveedor();
  return useMemo(() => (rut ? dps.filter((d) => d.proveedorRut === rut) : []), [dps, rut]);
}

export async function siguienteNumeroOC(): Promise<string> {
  const ocs = await ordenesCompraCol.list();
  const year = new Date().getFullYear();
  return `OC-${year}-${String(ocs.length + 1).padStart(3, '0')}`;
}

export async function acusarDte(id: string, estado: DteProveedor['estado']) {
  await dtesProveedorCol.update(id, { estado });
}

export async function recibirOrdenCompra(oc: OrdenCompra) {
  await ordenesCompraCol.update(oc.id, { estado: 'recibida' });
}
