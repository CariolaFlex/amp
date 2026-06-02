'use client';

import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { mockOportunidades } from '@/lib/mock/oportunidades';
import { mockDtes } from '@/lib/mock/dtes';
import { mockProductos } from '@/lib/mock/productos';
import { mockClientes } from '@/lib/mock/clientes';
import { formatCLP } from '@/lib/utils/clp';
import {
  Search, LayoutDashboard, Users, FileText, Package,
  ShoppingCart, BookOpen, Wallet, UserCheck, X,
  ContactRound, DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAVEGACION = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Navegación' },
  { label: 'Pipeline CRM', href: '/crm', icon: Users, group: 'Navegación' },
  { label: 'Clientes', href: '/crm/clientes', icon: ContactRound, group: 'Navegación' },
  { label: 'Cotizaciones y DTE', href: '/dte', icon: FileText, group: 'Navegación' },
  { label: 'Nueva cotización', href: '/dte/nueva', icon: FileText, group: 'Navegación' },
  { label: 'Inventario', href: '/inventory', icon: Package, group: 'Navegación' },
  { label: 'Compras', href: '/purchasing', icon: ShoppingCart, group: 'Navegación' },
  { label: 'Contabilidad', href: '/accounting', icon: BookOpen, group: 'Navegación' },
  { label: 'Libro Mayor', href: '/accounting/mayor', icon: BookOpen, group: 'Navegación' },
  { label: 'Balance 8 columnas', href: '/accounting/balance', icon: BookOpen, group: 'Navegación' },
  { label: 'F29', href: '/accounting/f29', icon: BookOpen, group: 'Navegación' },
  { label: 'Tesorería', href: '/treasury', icon: Wallet, group: 'Navegación' },
  { label: 'Bancos y Conciliación', href: '/treasury/bancos', icon: Wallet, group: 'Navegación' },
  { label: 'RRHH', href: '/payroll', icon: UserCheck, group: 'Navegación' },
  { label: 'Boletas de Honorarios', href: '/payroll/bhe', icon: UserCheck, group: 'Navegación' },
];

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(v => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery('');
  };

  const q = query.toLowerCase();

  const navFiltrada = NAVEGACION.filter(n => !q || n.label.toLowerCase().includes(q));

  const opsFiltradas = mockOportunidades.filter(o =>
    !q || o.titulo.toLowerCase().includes(q) || o.clienteNombre.toLowerCase().includes(q) || o.clienteRut.includes(q)
  ).slice(0, 4);

  const dtesFiltrados = mockDtes.filter(d =>
    !q || String(d.folio).includes(q) || d.clienteNombre.toLowerCase().includes(q) || d.clienteRut.includes(q)
  ).slice(0, 4);

  const productosFiltrados = mockProductos.filter(p =>
    !q || p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  ).slice(0, 3);

  const clientesFiltrados = mockClientes.filter((c) => {
    if (!q) return false;
    const nombre = c.tipo === 'empresa'
      ? (c.nombreEmpresa ?? '')
      : `${c.nombres ?? ''} ${c.apellidos ?? ''}`;
    return nombre.toLowerCase().includes(q) || (c.rut ?? '').includes(q);
  }).slice(0, 4);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <Command className="bg-transparent">
          {/* Input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Buscar páginas, clientes, folios, productos..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground">ESC</kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              Sin resultados para &ldquo;{query}&rdquo;
            </Command.Empty>

            {/* Navegación */}
            {navFiltrada.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Navegación</span>}>
                {navFiltrada.slice(0, q ? undefined : 6).map(item => (
                  <Command.Item
                    key={item.href}
                    value={item.label}
                    onSelect={() => go(item.href)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer aria-selected:bg-muted transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Clientes */}
            {clientesFiltrados.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Clientes</span>}>
                {clientesFiltrados.map(c => {
                  const nombre = c.tipo === 'empresa'
                    ? c.nombreEmpresa
                    : `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim();
                  return (
                    <Command.Item
                      key={c.id}
                      value={`${nombre} ${c.rut ?? ''}`}
                      onSelect={() => go(`/crm/clientes/${c.id}`)}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer aria-selected:bg-muted transition-colors"
                    >
                      <ContactRound className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{nombre}</p>
                        <p className="text-xs text-muted-foreground">{c.rut ?? ''} · {c.tipo === 'empresa' ? 'Empresa' : 'Persona Natural'}</p>
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* Oportunidades */}
            {opsFiltradas.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Oportunidades CRM</span>}>
                {opsFiltradas.map(op => (
                  <Command.Item
                    key={op.id}
                    value={`${op.titulo} ${op.clienteNombre}`}
                    onSelect={() => go('/crm')}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer aria-selected:bg-muted transition-colors"
                  >
                    <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{op.titulo}</p>
                      <p className="text-xs text-muted-foreground truncate">{op.clienteNombre} · {formatCLP(op.monto)}</p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* DTEs */}
            {dtesFiltrados.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">DTEs emitidos</span>}>
                {dtesFiltrados.map(dte => (
                  <Command.Item
                    key={dte.id}
                    value={`folio ${dte.folio} ${dte.clienteNombre}`}
                    onSelect={() => go('/dte')}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer aria-selected:bg-muted transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">Folio #{dte.folio} — {dte.clienteNombre}</p>
                      <p className="text-xs text-muted-foreground">{formatCLP(dte.total)} · {dte.clienteRut}</p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Productos */}
            {productosFiltrados.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Productos</span>}>
                {productosFiltrados.map(p => (
                  <Command.Item
                    key={p.id}
                    value={`${p.sku} ${p.nombre}`}
                    onSelect={() => go('/inventory')}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer aria-selected:bg-muted transition-colors"
                  >
                    <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{p.nombre}</p>
                      <p className="text-xs text-muted-foreground">{p.sku} · Stock: {p.stockDisponible} {p.unidad}</p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t px-4 py-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <kbd className="rounded border border-border bg-muted px-1">↑↓</kbd>navegar
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <kbd className="rounded border border-border bg-muted px-1">↵</kbd>abrir
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <kbd className="rounded border border-border bg-muted px-1">ESC</kbd>cerrar
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}

export function useCommandSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
}
