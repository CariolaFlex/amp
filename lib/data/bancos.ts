'use client';

/** Acceso de datos de Bancos. SQL-ready vía colecciones base. */

import { useMemo } from 'react';
import { cuentasBancariasCol, movimientosBancariosCol } from './collections';
import { useCollection } from './collection';
import type { MovimientoBancario } from '@/types';

export { cuentasBancariasCol, movimientosBancariosCol };

export function useCuentasBancarias() { return useCollection(cuentasBancariasCol); }
export function useMovimientosBancarios() { return useCollection(movimientosBancariosCol); }

export function useMovimientosByCuenta(cuentaId: string | undefined): MovimientoBancario[] {
  const all = useCollection(movimientosBancariosCol);
  return useMemo(() => (cuentaId ? all.filter((m) => m.cuentaId === cuentaId) : []), [all, cuentaId]);
}

/** Registra un movimiento y ajusta el saldo de la cuenta. */
export async function registrarMovimientoBancario(cuentaId: string, fecha: Date, descripcion: string, monto: number): Promise<void> {
  await movimientosBancariosCol.create({
    cuentaId,
    fecha,
    descripcion,
    monto,
    tipo: monto >= 0 ? 'abono' : 'cargo',
  });
  const cuenta = await cuentasBancariasCol.getById(cuentaId);
  if (cuenta) {
    await cuentasBancariasCol.update(cuentaId, { saldo: cuenta.saldo + monto, ultimaConciliacion: fecha });
  }
}
