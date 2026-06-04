'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Sun, Moon, Bell, Menu, X, ChevronRight, Settings, LogOut, User, Search, Repeat,
  CheckCheck, Package, ShoppingCart, FileText, Truck,
} from 'lucide-react';
import { useClientes, nombreCliente } from '@/lib/data/clientes';
import { useNotificaciones, useMarcarLeida, useMarcarTodasLeidas } from '@/lib/data/notificaciones';
import type { ClienteMaestro } from '@/types';

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
  arquitectura: 'Arquitectura',
};

function resolveLabel(seg: string, clientes: ClienteMaestro[]): string {
  if (LABELS[seg]) return LABELS[seg];
  const cliente = clientes.find((c) => c.id === seg);
  if (cliente) return nombreCliente(cliente);
  return seg;
}

function buildCrumbs(pathname: string, clientes: ClienteMaestro[]) {
  const segs = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];
  let path = '';
  segs.forEach((seg, i) => {
    path += `/${seg}`;
    crumbs.push({ label: resolveLabel(seg, clientes), href: i < segs.length - 1 ? path : undefined });
  });
  return crumbs;
}

function iniciales(nombre: string): string {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';
}

const TIPO_ICON: Record<string, React.ReactNode> = {
  dte_emitido:  <FileText className="h-3.5 w-3.5 text-green-500" />,
  dte_recibido: <Truck className="h-3.5 w-3.5 text-blue-500" />,
  dte_acusado:  <CheckCheck className="h-3.5 w-3.5 text-purple-500" />,
  oc_creada:    <ShoppingCart className="h-3.5 w-3.5 text-orange-500" />,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

function BellButton() {
  const [open, setOpen] = useState(false);
  const { data: notificaciones = [] } = useNotificaciones();
  const marcarLeida = useMarcarLeida();
  const marcarTodas = useMarcarTodasLeidas();

  const noLeidas = notificaciones.filter((n) => !n.leida);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4" />
        {noLeidas.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {noLeidas.length > 9 ? '9+' : noLeidas.length}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-1.5 w-80 rounded-lg border bg-card shadow-xl">
            {/* Header del panel */}
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <span className="text-sm font-semibold">Notificaciones</span>
              {noLeidas.length > 0 && (
                <button
                  onClick={() => marcarTodas.mutate()}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas
                </button>
              )}
            </div>

            {/* Lista */}
            <div className="max-h-80 overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <Package className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Sin notificaciones</p>
                </div>
              ) : (
                notificaciones.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { if (!n.leida) marcarLeida.mutate(n.id); }}
                    className={cn(
                      'flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/60',
                      !n.leida && 'bg-primary/5',
                    )}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {TIPO_ICON[n.tipo] ?? <Bell className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-xs leading-snug', !n.leida ? 'font-medium' : 'text-muted-foreground')}>
                        {n.mensaje}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(n.creadoEn)}</p>
                    </div>
                    {!n.leida && (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { toggleMobileSidebar, sidebarMobileOpen } = useUIStore();
  const [showUser, setShowUser] = useState(false);

  const clientes = useClientes();
  const { data: session } = useSession();
  const user = session?.user;
  const contexto = session?.user?.contexto;

  const crumbs = buildCrumbs(pathname ?? '', clientes);

  const openSearch = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  const handleLogout = () => signOut({ callbackUrl: '/login' });

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
                : <span className="font-medium text-foreground">{c.label}</span>}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Contexto activo */}
        {contexto && (
          <button
            onClick={() => router.push('/seleccionar-contexto')}
            title="Cambiar plataforma / centro de costo"
            className="mr-1 hidden items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs hover:bg-muted md:flex"
          >
            <span className="font-medium">{contexto.plataformaNombre}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{contexto.centroCostoNombre}</span>
            <Repeat className="h-3 w-3 text-muted-foreground" />
          </button>
        )}

        <button onClick={openSearch} className="mr-1 hidden items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted sm:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
          <kbd className="rounded border border-border bg-background px-1 text-[10px]">⌘K</kbd>
        </button>

        <BellButton />

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User */}
        <div className="relative ml-1">
          <button onClick={() => setShowUser((v) => !v)} className={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted', showUser && 'bg-muted')}>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{iniciales(user?.name ?? '')}</div>
            <span className="hidden font-medium md:block">{user?.name ?? 'Usuario'}</span>
          </button>
          {showUser && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUser(false)} />
              <div className="absolute right-0 z-50 mt-1.5 w-56 rounded-lg border bg-card shadow-lg">
                <div className="border-b px-3 py-2.5">
                  <p className="text-sm font-medium">{user?.name ?? 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
                </div>
                <div className="p-1">
                  <button onClick={() => { setShowUser(false); router.push('/seleccionar-contexto'); }} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-muted">
                    <Repeat className="h-4 w-4 text-muted-foreground" />Cambiar contexto
                  </button>
                  <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />Mi perfil
                  </button>
                  <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-muted">
                    <Settings className="h-4 w-4 text-muted-foreground" />Configuración
                  </button>
                </div>
                <div className="border-t p-1">
                  <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" />Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
