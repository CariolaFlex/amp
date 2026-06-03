'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Cotizaciones', href: '/dte/cotizaciones' },
  { label: 'Órdenes de Venta', href: '/dte/ordenes' },
  { label: 'DTEs Emitidos', href: '/dte' },
];

export function VentasNav() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 border-b">
      {TABS.map((t) => {
        const active = t.href === '/dte' ? pathname === '/dte' : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'border-b-2 px-3 py-2 text-xs font-medium transition-colors',
              active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
