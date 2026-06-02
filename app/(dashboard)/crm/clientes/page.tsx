'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockClientes } from '@/lib/mock/clientes';
import type { ClienteMaestro } from '@/types';

function formatFecha(d: Date) {
  return new Date(d).toLocaleDateString('es-CL');
}

function NombreDisplay({ c }: { c: ClienteMaestro }) {
  if (c.tipo === 'empresa') return <span>{c.nombreEmpresa}</span>;
  return <span>{c.nombres} {c.apellidos}</span>;
}

export default function ClientesPage() {
  const [query, setQuery] = useState('');

  const clientes = mockClientes.filter((c) => {
    if (!query) return true;
    const nombre = c.tipo === 'empresa'
      ? (c.nombreEmpresa ?? '')
      : `${c.nombres ?? ''} ${c.apellidos ?? ''}`;
    const rut = c.rut ?? '';
    return (
      nombre.toLowerCase().includes(query.toLowerCase()) ||
      rut.includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gestione la información detallada del maestro de clientes
          </p>
        </div>
        <Button asChild>
          <Link href="/crm/clientes/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o RUT..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre / Empresa</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">RUT</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Teléfono</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Canal Origen</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha Alta</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    No se encontraron clientes
                  </td>
                </tr>
              )}
              {clientes.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.idCliente}</td>
                  <td className="px-4 py-3 font-medium">
                    <NombreDisplay c={c} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.tipo === 'empresa' ? 'secondary' : 'outline'} className="text-xs">
                      {c.tipo === 'empresa' ? 'Empresa' : 'Persona Natural'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.rut ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.emailPrincipal ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.telefonoPrincipal ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.canalOrigen ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatFecha(c.fechaAlta)}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/crm/clientes/${c.id}`}>Ver ficha</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Mostrando {clientes.length} de {mockClientes.length} clientes
        </div>
      </div>
    </div>
  );
}
