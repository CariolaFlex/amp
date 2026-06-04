'use client';

/**
 * Flujo de ventas: Cotización → Orden de Venta → DTE.
 * Las tres entidades quedan encadenadas (cotizacion.ordenVentaId, ov.dteId,
 * dte.ordenVentaId). SQL-ready vía colecciones base.
 */

import { cotizacionesCol, ordenesVentaCol, dtesCol, productosCol } from './collections';
import { useCollection, useCollectionItem } from './collection';
import { registrarMovimiento } from './inventory';
import type { Cotizacion, OrdenVenta, Dte, LineaDte, TipoDte } from '@/types';

export { cotizacionesCol, ordenesVentaCol, dtesCol };

export function useCotizaciones() { return useCollection(cotizacionesCol); }
export function useOrdenesVenta() { return useCollection(ordenesVentaCol); }
export function useDtes() { return useCollection(dtesCol); }

export function useDte(id: string | undefined) { return useCollectionItem(dtesCol, id); }
export function useOrdenVenta(id: string | undefined) { return useCollectionItem(ordenesVentaCol, id); }
export function useCotizacion(id: string | undefined) { return useCollectionItem(cotizacionesCol, id); }

export async function marcarDtePagado(id: string) { await dtesCol.update(id, { estado: 'pagado' }); }
export async function anularDte(id: string) { await dtesCol.update(id, { estado: 'anulado' }); }

export async function actualizarCotizacion(
  id: string,
  patch: Partial<Pick<Cotizacion, 'tipoDte' | 'condicionPago' | 'lineas' | 'notas' | 'neto' | 'iva' | 'total' | 'clienteId' | 'clienteNombre' | 'clienteRut' | 'estado'>>,
) {
  await cotizacionesCol.update(id, patch);
}

/** Anula una OV: revierte cotización a 'aprobada' y, si ya tenía DTE, anula el DTE y repone stock. */
export async function anularOrdenVenta(ov: OrdenVenta) {
  await ordenesVentaCol.update(ov.id, { estado: 'anulada' });
  if (ov.cotizacionId) {
    await cotizacionesCol.update(ov.cotizacionId, { estado: 'aprobada', ordenVentaId: undefined });
  }
  if (ov.dteId) {
    await dtesCol.update(ov.dteId, { estado: 'anulado' });
    if (ov.tipoDte !== 61) {
      for (const linea of ov.lineas) {
        if (!linea.productoId) continue;
        const producto = await productosCol.getById(linea.productoId);
        if (producto) {
          await registrarMovimiento(producto, 'entrada', linea.cantidad, `Anulación ${ov.numero}`, 'Sistema');
        }
      }
    }
  }
}

/** IVA aplica a Factura Afecta (33) y Boleta (39). El resto es exento. */
export function aplicaIva(tipo: TipoDte): boolean {
  return tipo === 33 || tipo === 39;
}

export function calcTotales(lineas: LineaDte[], tipo: TipoDte) {
  const neto = lineas.reduce((s, l) => s + l.total, 0);
  const iva = aplicaIva(tipo) ? Math.round(neto * 0.19) : 0;
  return { neto, iva, total: neto + iva };
}

function correlativo(prefijo: string, existentes: { numero: string }[]): string {
  const year = new Date().getFullYear();
  const n = existentes.length + 1;
  return `${prefijo}-${year}-${String(n).padStart(3, '0')}`;
}

export async function siguienteNumeroCotizacion(): Promise<string> {
  return correlativo('COT', await cotizacionesCol.list());
}
export async function siguienteNumeroOV(): Promise<string> {
  return correlativo('OV', await ordenesVentaCol.list());
}
export async function siguienteFolio(): Promise<number> {
  const dtes = await dtesCol.list();
  return dtes.reduce((max, d) => Math.max(max, d.folio), 0) + 1;
}

export async function aprobarCotizacion(id: string) {
  await cotizacionesCol.update(id, { estado: 'aprobada' });
}
export async function rechazarCotizacion(id: string) {
  await cotizacionesCol.update(id, { estado: 'rechazada' });
}

/** Convierte una cotización aprobada en Orden de Venta. */
export async function convertirAOrdenVenta(cot: Cotizacion): Promise<OrdenVenta> {
  const ov = await ordenesVentaCol.create({
    numero: await siguienteNumeroOV(),
    cotizacionId: cot.id,
    clienteId: cot.clienteId,
    clienteNombre: cot.clienteNombre,
    clienteRut: cot.clienteRut,
    tipoDte: cot.tipoDte,
    fechaEmision: new Date(),
    lineas: cot.lineas,
    neto: cot.neto,
    iva: cot.iva,
    total: cot.total,
    estado: 'pendiente',
    vendedorNombre: cot.vendedorNombre,
  });
  await cotizacionesCol.update(cot.id, { estado: 'convertida', ordenVentaId: ov.id });
  return ov;
}

/** Emite el DTE de una Orden de Venta pendiente. */
export async function emitirDteDesdeOV(ov: OrdenVenta): Promise<Dte> {
  const folio = await siguienteFolio();
  const fechaEmision = new Date();
  const fechaVencimiento = new Date(fechaEmision);
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

  const dte = await dtesCol.create({
    folio,
    tipo: ov.tipoDte,
    estado: 'enviado_sii',
    clienteRut: ov.clienteRut,
    clienteNombre: ov.clienteNombre,
    fechaEmision,
    fechaVencimiento,
    neto: ov.neto,
    iva: ov.iva,
    total: ov.total,
    lineas: ov.lineas,
    ordenVentaId: ov.id,
  });
  await ordenesVentaCol.update(ov.id, { estado: 'facturada', dteId: dte.id });

  // Descontar stock de las líneas que provienen del inventario (no en NC tipo 61)
  if (ov.tipoDte !== 61) {
    for (const linea of ov.lineas) {
      if (!linea.productoId) continue;
      const producto = await productosCol.getById(linea.productoId);
      if (producto) {
        await registrarMovimiento(producto, 'salida', linea.cantidad, `DTE #${folio}`, 'Venta');
      }
    }
  }
  return dte;
}
