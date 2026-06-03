'use client';

/** Acceso de datos de Inventario. SQL-ready vía colecciones base. */

import { useMemo } from 'react';
import { productosCol, movimientosCol } from './collections';
import { useCollection } from './collection';
import type { Producto, EstadoStock, MovimientoStock } from '@/types';

export { productosCol, movimientosCol };

/** Estado de stock derivado (no se confía en el campo almacenado). */
export function calcEstado(disponible: number, minimo: number): EstadoStock {
  if (disponible <= 0) return 'sin_stock';
  if (minimo > 0 && disponible <= minimo) return 'bajo_minimo';
  return 'ok';
}

export function useProductos(): Producto[] {
  const productos = useCollection(productosCol);
  return useMemo(
    () => productos.map((p) => ({ ...p, estado: calcEstado(p.stockDisponible, p.stockMinimo) })),
    [productos],
  );
}

export function useProducto(id: string | undefined): Producto | undefined {
  const productos = useProductos();
  return id ? productos.find((p) => p.id === id) : undefined;
}

export function useMovimientos(): MovimientoStock[] {
  return useCollection(movimientosCol);
}

export function useMovimientosByProducto(productoId: string | undefined): MovimientoStock[] {
  const all = useCollection(movimientosCol);
  return useMemo(() => (productoId ? all.filter((m) => m.productoId === productoId) : []), [all, productoId]);
}

/**
 * Registra un movimiento de stock y actualiza el stock del producto en una
 * sola operación. `cantidad` se interpreta según el tipo:
 *  - entrada → suma (se fuerza positivo)
 *  - salida  → resta (se fuerza negativo)
 *  - ajuste / transferencia → usa el signo tal cual
 */
export async function registrarMovimiento(
  producto: Producto,
  tipo: MovimientoStock['tipo'],
  cantidad: number,
  motivo: string,
  usuario: string,
): Promise<void> {
  const magnitud = Math.abs(cantidad);
  const delta = tipo === 'entrada' ? magnitud : tipo === 'salida' ? -magnitud : cantidad;
  const nuevoStock = Math.max(0, producto.stockDisponible + delta);

  await movimientosCol.create({
    productoId: producto.id,
    productoNombre: producto.nombre,
    tipo,
    cantidad: delta,
    motivo: motivo || undefined,
    fecha: new Date(),
    usuario,
  });
  await productosCol.update(producto.id, {
    stockDisponible: nuevoStock,
    estado: calcEstado(nuevoStock, producto.stockMinimo),
  });
}
