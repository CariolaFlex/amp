'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Package, ShoppingCart,
  BookOpen, Wallet, UserCheck, ChevronLeft, ChevronRight,
  LogOut, Building2, ContactRound, type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Resumen general' },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { label: 'Pipeline CRM', href: '/crm', icon: Users, description: 'Oportunidades y prospectos' },
      { label: 'Clientes', href: '/crm/clientes', icon: ContactRound, description: 'Maestro de clientes' },
      { label: 'Prospectos', href: '/crm/leads', icon: Users, description: 'Leads y prospectos' },
      { label: 'Cotizaciones / DTE', href: '/dte', icon: FileText, description: 'Facturas y boletas' },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Inventario', href: '/inventory', icon: Package, description: 'Stock y productos' },
      { label: 'Compras', href: '/purchasing', icon: ShoppingCart, description: 'OC y proveedores' },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { label: 'Contabilidad', href: '/accounting', icon: BookOpen, description: 'Libros y F29' },
      { label: 'Tesorería', href: '/treasury', icon: Wallet, description: 'CxC, CxP y bancos' },
    ],
  },
  {
    label: 'Personas',
    items: [
      { label: 'RRHH', href: '/payroll', icon: UserCheck, description: 'Empleados y honorarios' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setMobileSidebarOpen } = useUIStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href || pathname === '/';
    // /crm solo activo para pipeline, no para /crm/clientes
    if (href === '/crm') {
      return pathname === '/crm'
        || pathname.startsWith('/crm/lista')
        || pathname.startsWith('/crm/leads')
        || pathname.startsWith('/crm/prospectos');
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="flex h-full flex-col border-r bg-card overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b px-3 flex-shrink-0">
        <Link href="/dashboard" className={cn('flex items-center gap-2 min-w-0 flex-1', sidebarCollapsed && 'justify-center')} onClick={() => setMobileSidebarOpen(false)}>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary flex-shrink-0">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }} transition={{ duration: 0.15 }} className="whitespace-nowrap text-sm font-bold">
                Ampuero<span className="text-primary">ERP</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden h-7 w-7 lg:flex flex-shrink-0 text-muted-foreground">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-1' : ''}>
            {gi > 0 && <div className="mx-3 mt-2 mb-1 border-t border-border" />}
            {group.label && !sidebarCollapsed && (
              <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={cn(
                        'flex items-center rounded-md py-2 text-sm transition-all border-l-2',
                        sidebarCollapsed ? 'justify-center px-2' : 'gap-2.5 px-2.5',
                        active
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="min-w-0">
                            <span className="block leading-snug text-sm">{item.label}</span>
                            {item.description && (
                              <span className="block truncate text-[10px] leading-tight text-muted-foreground">{item.description}</span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t flex-shrink-0">
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">CA</div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">CA</div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium leading-snug">Carlos Ampuero</p>
              <p className="truncate text-xs leading-tight text-muted-foreground">Owner · Los Andes SpA</p>
            </div>
            <button className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
