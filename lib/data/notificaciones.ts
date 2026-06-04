'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Notificacion {
  id: string;
  empresaId: string;
  usuarioId: string | null;
  tipo: string;
  mensaje: string;
  leida: boolean;
  creadoEn: string;
}

const QUERY_KEY = ['notificaciones'];

export function useNotificaciones() {
  return useQuery<Notificacion[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await fetch('/api/notificaciones');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}

export function useMarcarLeida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notificaciones/${id}/leer`, { method: 'PUT' });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useMarcarTodasLeidas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch('/api/notificaciones', { method: 'PUT' });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
