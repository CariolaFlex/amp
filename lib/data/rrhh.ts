'use client';

/** Acceso de datos de RRHH: empleados y boletas de honorarios. */

import { empleadosCol, bheCol } from './collections';
import { useCollection } from './collection';

export { empleadosCol, bheCol };

export function useEmpleados() { return useCollection(empleadosCol); }
export function useBhe() { return useCollection(bheCol); }
