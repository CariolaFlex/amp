'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClienteMaestro, DireccionCliente, TelefonoCliente, EmailCliente } from '@/types';

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/* ── Clientes ───────────────────────────────────────────────── */

export function useClientes() {
  const { data = [] } = useQuery<ClienteMaestro[]>({
    queryKey: ['clientes'],
    queryFn: () => fetchJson('/api/clientes'),
  });
  return data;
}

export function useCliente(id: string | undefined) {
  const { data } = useQuery<ClienteMaestro>({
    queryKey: ['clientes', id],
    queryFn: () => fetchJson(`/api/clientes/${id}`),
    enabled: !!id,
  });
  return data ?? null;
}

export function useCrearCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<ClienteMaestro>) =>
      fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useActualizarCliente(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<ClienteMaestro>) =>
      fetch(`/api/clientes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['clientes', id] });
    },
  });
}

/* ── Direcciones ────────────────────────────────────────────── */

export function useDireccionesByCliente(clienteId: string | undefined) {
  const { data = [] } = useQuery<DireccionCliente[]>({
    queryKey: ['direcciones', clienteId],
    queryFn: () => fetchJson(`/api/clientes/${clienteId}/direcciones`),
    enabled: !!clienteId,
  });
  return data;
}

export function useCrearDireccion(clienteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<DireccionCliente>) =>
      fetch(`/api/clientes/${clienteId}/direcciones`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['direcciones', clienteId] }),
  });
}

export function useActualizarDireccion(clienteId: string, dirId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<DireccionCliente>) =>
      fetch(`/api/clientes/${clienteId}/direcciones/${dirId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['direcciones', clienteId] }),
  });
}

export function useEliminarDireccion(clienteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dirId: string) =>
      fetch(`/api/clientes/${clienteId}/direcciones/${dirId}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['direcciones', clienteId] }),
  });
}

/* ── Teléfonos ──────────────────────────────────────────────── */

export function useTelefonosByCliente(clienteId: string | undefined) {
  const { data = [] } = useQuery<TelefonoCliente[]>({
    queryKey: ['telefonos', clienteId],
    queryFn: () => fetchJson(`/api/clientes/${clienteId}/telefonos`),
    enabled: !!clienteId,
  });
  return data;
}

export function useCrearTelefono(clienteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<TelefonoCliente>) =>
      fetch(`/api/clientes/${clienteId}/telefonos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['telefonos', clienteId] }),
  });
}

export function useActualizarTelefono(clienteId: string, telId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<TelefonoCliente>) =>
      fetch(`/api/clientes/${clienteId}/telefonos/${telId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['telefonos', clienteId] }),
  });
}

export function useEliminarTelefono(clienteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (telId: string) =>
      fetch(`/api/clientes/${clienteId}/telefonos/${telId}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['telefonos', clienteId] }),
  });
}

/* ── Emails ─────────────────────────────────────────────────── */

export function useEmailsByCliente(clienteId: string | undefined) {
  const { data = [] } = useQuery<EmailCliente[]>({
    queryKey: ['emails', clienteId],
    queryFn: () => fetchJson(`/api/clientes/${clienteId}/emails`),
    enabled: !!clienteId,
  });
  return data;
}

export function useCrearEmail(clienteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<EmailCliente>) =>
      fetch(`/api/clientes/${clienteId}/emails`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emails', clienteId] }),
  });
}

export function useActualizarEmail(clienteId: string, emailId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<EmailCliente>) =>
      fetch(`/api/clientes/${clienteId}/emails/${emailId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emails', clienteId] }),
  });
}

export function useEliminarEmail(clienteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (emailId: string) =>
      fetch(`/api/clientes/${clienteId}/emails/${emailId}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emails', clienteId] }),
  });
}

/* ── helpers ────────────────────────────────────────────────── */

export function nombreCliente(c: Pick<ClienteMaestro, 'tipo' | 'nombres' | 'apellidos' | 'nombreEmpresa' | 'razonSocial'>): string {
  if (c.tipo === 'empresa') {
    return c.nombreEmpresa || c.razonSocial || 'Empresa sin nombre';
  }
  return [c.nombres, c.apellidos].filter(Boolean).join(' ') || 'Cliente sin nombre';
}
