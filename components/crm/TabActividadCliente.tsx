'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOportunidades } from '@/lib/data/crm';
import { useCotizaciones, useDtes } from '@/lib/data/ventas';
import { useCuentasCobrar } from '@/lib/data/tesoreria';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { TrendingUp, FileText, Receipt, Coins, Plus } from 'lucide-react';
import type { ClienteMaestro } from '@/types';

function Seccion({ titulo, icon: Icon, count, children }: { titulo: string; icon: React.ElementType; count: number; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">{titulo}</span>
        <Badge variant="secondary" className="ml-auto text-[10px]">{count}</Badge>
      </div>
      <div className="divide-y">{children}</div>
    </div>
  );
}

export function TabActividadCliente({ cliente }: { cliente: ClienteMaestro }) {
  const rut = cliente.rut ?? '';
  const oportunidades = useOportunidades();
  const cotizaciones = useCotizaciones();
  const dtes = useDtes();
  const cxc = useCuentasCobrar();

  const ops = useMemo(() => oportunidades.filter((o) => o.clienteRut === rut), [oportunidades, rut]);
  const cots = useMemo(() => cotizaciones.filter((c) => c.clienteId === cliente.id || c.clienteRut === rut), [cotizaciones, rut, cliente.id]);
  const docs = useMemo(() => dtes.filter((d) => d.clienteRut === rut), [dtes, rut]);
  const cobros = useMemo(() => cxc.filter((c) => c.clienteRut === rut), [cxc, rut]);

  const totalFacturado = docs.filter((d) => d.estado !== 'anulado' && d.total > 0).reduce((s, d) => s + d.total, 0);
  const totalPorCobrar = cobros.reduce((s, c) => s + c.saldo, 0);

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Oportunidades</p><p className="text-lg font-bold">{ops.length}</p></div>
        <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">DTEs</p><p className="text-lg font-bold">{docs.length}</p></div>
        <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Facturado</p><p className="text-lg font-bold">{formatCLP(totalFacturado)}</p></div>
        <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Por cobrar</p><p className="text-lg font-bold text-warning">{formatCLP(totalPorCobrar)}</p></div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="h-8 text-xs" asChild>
          <Link href={`/dte/nueva?clienteRut=${encodeURIComponent(rut)}`}><Plus className="mr-1 h-3.5 w-3.5" />Nueva cotización</Link>
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
          <Link href={`/crm/lista`}><TrendingUp className="mr-1 h-3.5 w-3.5" />Ver pipeline</Link>
        </Button>
      </div>

      <Seccion titulo="Oportunidades" icon={TrendingUp} count={ops.length}>
        {ops.length === 0 ? <p className="px-4 py-3 text-xs text-muted-foreground">Sin oportunidades.</p> : ops.map((o) => (
          <Link key={o.id} href="/crm/lista" className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/40">
            <span className="truncate">{o.titulo}</span>
            <span className="ml-2 flex items-center gap-2 text-xs"><Badge variant="outline">{o.etapa}</Badge><span className="font-medium">{formatCLP(o.monto)}</span></span>
          </Link>
        ))}
      </Seccion>

      <Seccion titulo="Cotizaciones" icon={FileText} count={cots.length}>
        {cots.length === 0 ? <p className="px-4 py-3 text-xs text-muted-foreground">Sin cotizaciones.</p> : cots.map((c) => (
          <Link key={c.id} href="/dte/cotizaciones" className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/40">
            <span className="font-mono text-xs">{c.numero}</span>
            <span className="ml-2 flex items-center gap-2 text-xs"><Badge variant="outline">{c.estado}</Badge><span className="font-medium">{formatCLP(c.total)}</span></span>
          </Link>
        ))}
      </Seccion>

      <Seccion titulo="DTEs emitidos" icon={Receipt} count={docs.length}>
        {docs.length === 0 ? <p className="px-4 py-3 text-xs text-muted-foreground">Sin DTEs.</p> : docs.map((d) => (
          <Link key={d.id} href={`/dte/${d.id}`} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/40">
            <span>DTE #{d.folio} <span className="text-xs text-muted-foreground">· {formatDate(d.fechaEmision)}</span></span>
            <span className="ml-2 flex items-center gap-2 text-xs"><Badge variant="outline">{d.estado}</Badge><span className="font-medium">{formatCLP(d.total)}</span></span>
          </Link>
        ))}
      </Seccion>

      <Seccion titulo="Cuentas por cobrar" icon={Coins} count={cobros.length}>
        {cobros.length === 0 ? <p className="px-4 py-3 text-xs text-muted-foreground">Sin saldos pendientes.</p> : cobros.map((c) => (
          <Link key={c.id} href="/treasury" className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/40">
            <span>Folio #{c.folioDte} <span className="text-xs text-muted-foreground">· vence {formatDate(c.fechaVencimiento)}</span></span>
            <span className="ml-2 flex items-center gap-2 text-xs"><Badge variant="outline">{c.aging} días</Badge><span className="font-medium">{formatCLP(c.saldo)}</span></span>
          </Link>
        ))}
      </Seccion>
    </div>
  );
}
