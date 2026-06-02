'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Sun, Moon, Bell, Menu, X, ChevronRight, Settings, LogOut, User, Search,
} from 'lucide-react';
import { mockClientes } from '@/lib/mock/clientes';

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  crm: 'CRM',
  lista: 'Vista Lista',
  leads: 'Prospectos',
  prospectos: 'Prospectos',
  clientes: 'Clientes',
  nuevo: 'Nuevo Cliente',
  contactos: 'Contactos',
  empresas: 'Empresas',
  dte: 'Cotizaciones y DTE',
  cotizaciones: 'Cotizaciones',
  nueva: 'Nueva',
  inventory: 'Inventario',
  movimientos: 'Movimientos',
  purchasing: 'Compras',
  acuse: 'Acuse DTE',
  accounting: 'Contabilidad',
  mayor: 'Libro Mayor',
  balance: 'Balance',
  f29: 'Propuesta F29',
  treasury: 'Tesorería',
  cxp: 'Cuentas por Pagar',
  bancos: 'Bancos',
  payroll: 'RRHH',
  bhe: 'Boletas de Honorarios',
};

function resolveLabel(seg: string): string {
  if (LABELS[seg]) return LABELS[seg];
  // Si es un ID de cliente (cli-xxx), buscar nombre
  const cliente = mockClientes.find((c) => c.id === seg);
  if (cliente) {
    return cliente.tipo === 'empresa'
      ? (cliente.nombreEmpresa ?? seg)
      : `${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`.trim() || seg;
  }
  return seg;
}

function buildCrumbs(pathname: string) {
  const segs = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];
  let path = '';
  segs.forEach((seg, i) => {
    path += `/${seg}`;
    const label = resolveLabel(seg);
    crumbs.push({ label, href: i < segs.length - 1 ? path : undefined });
  });
  return crumbs;
}

export function Header() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { toggleMobileSidebar, sidebarMobileOpen } = useUIStore();
  const [showUser, setShowUser] = useState(false);

  const crumbs = buildCrumbs(pathname ?? '');

  const openSearch = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="h-8 w-8 lg:hidden">
          {sidebarMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        <nav className="flex items-center gap-1 text-sm">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              {c.href
                ? <Link href={c.href} className="text-muted-foreground hover:text-foreground transition-colors">{c.label}</Link>
                : <span className="font-medium text-foreground">{c.label}</span>
              }
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Search hint */}
        <button onClick={openSearch} className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors mr-1">
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
          <kbd className="rounded border border-border bg-background px-1 text-[10px]">⌘K</kbd>
        </button>

        {/* Notificaciones */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* Theme */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User */}
        <div className="relative ml-1">
          <button onClick={() => setShowUser((v) => !v)} className={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted', showUser && 'bg-muted')}>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">CA</div>
            <span className="hidden font-medium md:block">Carlos Ampuero</span>
          </button>
          {showUser && (
            <div className="absolute right-0 mt-1.5 w-52 rounded-lg border bg-card shadow-lg z-50">
              <div className="border-b px-3 py-2.5">
                <p className="text-sm font-medium">Carlos Ampuero</p>
                <p className="text-xs text-muted-foreground">carlos@losandes.cl</p>
              </div>
              <div className="p-1">
                <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />Mi perfil
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-muted">
                  <Settings className="h-4 w-4 text-muted-foreground" />Configuración
                </button>
              </div>
              <div className="border-t p-1">
                <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" />Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
