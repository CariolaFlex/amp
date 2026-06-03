'use client';

/**
 * Tesorería derivada del flujo real:
 *  - CxC = DTEs emitidos (no pagados/anulados) con total positivo.
 *  - CxP = DTEs de proveedor aceptados (o con reserva).
 * Así Tesorería refleja automáticamente lo que se emite/recibe. SQL-ready:
 * más adelante esto puede venir de vistas/joins en SQL Server.
 */

import { useMemo } from 'react';
import { useDtes } from './ventas';
import { useDtesProveedor } from './compras';
import type { CuentaCobrar, CuentaPagar, BucketAging } from '@/types';

export function bucketAging(fechaVencimiento?: Date): BucketAging {
  if (!fechaVencimiento) return '0-30';
  const dias = Math.floor((Date.now() - new Date(fechaVencimiento).getTime()) / (24 * 3600 * 1000));
  if (dias <= 30) return '0-30';
  if (dias <= 60) return '31-60';
  if (dias <= 90) return '61-90';
  return '+90';
}

export function useCuentasCobrar(): CuentaCobrar[] {
  const dtes = useDtes();
  return useMemo(
    () =>
      dtes
        .filter((d) => d.total > 0 && d.estado !== 'pagado' && d.estado !== 'anulado' && d.estado !== 'borrador')
        .map((d) => ({
          id: d.id,
          clienteNombre: d.clienteNombre,
          clienteRut: d.clienteRut,
          folioDte: d.folio,
          fechaEmision: d.fechaEmision,
          fechaVencimiento: d.fechaVencimiento ?? d.fechaEmision,
          monto: d.total,
          saldo: d.total,
          aging: bucketAging(d.fechaVencimiento),
        })),
    [dtes],
  );
}

export function useCuentasPagar(): CuentaPagar[] {
  const dtesProv = useDtesProveedor();
  return useMemo(
    () =>
      dtesProv
        .filter((d) => d.estado === 'aceptado' || d.estado === 'aceptado_con_reserva')
        .map((d) => ({
          id: d.id,
          proveedorNombre: d.proveedorNombre,
          proveedorRut: d.proveedorRut,
          folioDte: d.folio,
          fechaEmision: d.fechaEmision,
          fechaVencimiento: d.fechaLimiteAcuse,
          monto: d.total,
          saldo: d.total,
        })),
    [dtesProv],
  );
}
