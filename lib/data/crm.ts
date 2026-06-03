'use client';

/** Acceso de datos del CRM (pipeline + leads). SQL-ready vía colecciones base. */

import { oportunidadesCol, leadsCol } from './collections';
import { useCollection, useCollectionItem } from './collection';
import type { EtapaPipeline } from '@/types';

export { oportunidadesCol, leadsCol };

export function useOportunidades() {
  return useCollection(oportunidadesCol);
}

export function useOportunidad(id: string | undefined) {
  return useCollectionItem(oportunidadesCol, id);
}

export function useLeads() {
  return useCollection(leadsCol);
}

const PROB_POR_ETAPA: Record<EtapaPipeline, number> = {
  prospeccion: 20, calificado: 40, cotizacion_enviada: 55, negociacion: 70, ganada: 100, perdida: 0,
};

export async function setEtapaOportunidad(id: string, etapa: EtapaPipeline) {
  await oportunidadesCol.update(id, { etapa, probabilidad: PROB_POR_ETAPA[etapa], ultimaActividad: new Date() });
}
