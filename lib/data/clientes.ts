'use client';

/**
 * Acceso de datos del Maestro de Clientes.
 * Wrappers reactivos sobre las colecciones para usar en componentes.
 * SQL-ready: cuando exista el backend, reimplementar las colecciones base.
 */

import { useMemo } from 'react';
import {
  clientesCol,
  direccionesCol,
  telefonosCol,
  emailsCol,
} from './collections';
import { useCollection, useCollectionItem } from './collection';
import type { ClienteMaestro } from '@/types';

export { clientesCol, direccionesCol, telefonosCol, emailsCol };

/* ── lecturas reactivas ─────────────────────────────────────── */

export function useClientes() {
  const clientes = useCollection(clientesCol);
  const emails = useCollection(emailsCol);
  const telefonos = useCollection(telefonosCol);

  // enriquecer con email/teléfono preferido para la lista
  return useMemo<ClienteMaestro[]>(() => {
    return clientes.map((c) => {
      const email =
        emails.find((e) => e.clienteId === c.id && e.esPreferido) ??
        emails.find((e) => e.clienteId === c.id);
      const tel =
        telefonos.find((t) => t.clienteId === c.id && t.esPreferido) ??
        telefonos.find((t) => t.clienteId === c.id);
      return {
        ...c,
        emailPrincipal: email?.email ?? c.emailPrincipal,
        telefonoPrincipal: tel?.telefono ?? c.telefonoPrincipal,
      };
    });
  }, [clientes, emails, telefonos]);
}

export function useCliente(id: string | undefined) {
  return useCollectionItem(clientesCol, id);
}

export function useDireccionesByCliente(clienteId: string | undefined) {
  const all = useCollection(direccionesCol);
  return useMemo(
    () => (clienteId ? all.filter((d) => d.clienteId === clienteId) : []),
    [all, clienteId],
  );
}

export function useTelefonosByCliente(clienteId: string | undefined) {
  const all = useCollection(telefonosCol);
  return useMemo(
    () => (clienteId ? all.filter((t) => t.clienteId === clienteId) : []),
    [all, clienteId],
  );
}

export function useEmailsByCliente(clienteId: string | undefined) {
  const all = useCollection(emailsCol);
  return useMemo(
    () => (clienteId ? all.filter((e) => e.clienteId === clienteId) : []),
    [all, clienteId],
  );
}

/* ── nombre legible de un cliente (PN o Empresa) ────────────── */
export function nombreCliente(c: Pick<ClienteMaestro, 'tipo' | 'nombres' | 'apellidos' | 'nombreEmpresa' | 'razonSocial'>): string {
  if (c.tipo === 'empresa') {
    return c.nombreEmpresa || c.razonSocial || 'Empresa sin nombre';
  }
  return [c.nombres, c.apellidos].filter(Boolean).join(' ') || 'Cliente sin nombre';
}
