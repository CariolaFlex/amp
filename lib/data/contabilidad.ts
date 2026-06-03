'use client';

/** Acceso de datos de Contabilidad (libro diario). SQL-ready vía colección base. */

import { asientosCol } from './collections';
import { useCollection } from './collection';
import type { AsientoContable } from '@/types';

export { asientosCol };

export function useAsientos() { return useCollection(asientosCol); }

export async function siguienteNumeroAsiento(): Promise<number> {
  const asientos = await asientosCol.list();
  return asientos.reduce((m, a) => Math.max(m, a.numero), 100) + 1;
}

export interface LineaAsiento {
  cuentaCodigo: string;
  cuentaNombre: string;
  debe: number;
  haber: number;
}

/** Crea un asiento de doble partida (una fila por línea, mismo número). */
export async function crearAsiento(fecha: Date, glosa: string, lineas: LineaAsiento[]): Promise<void> {
  const numero = await siguienteNumeroAsiento();
  const periodo = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  for (const l of lineas) {
    await asientosCol.create({
      fecha,
      numero,
      glosa,
      debe: l.debe,
      haber: l.haber,
      cuentaCodigo: l.cuentaCodigo,
      cuentaNombre: l.cuentaNombre,
      periodo,
    });
  }
}
