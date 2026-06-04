'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate, daysUntil } from '@/lib/utils/dates';
import { useDtes } from '@/lib/data/ventas';
import { useDtesProveedor } from '@/lib/data/compras';
import { useOportunidades } from '@/lib/data/crm';
import { useProductos } from '@/lib/data/inventory';
import { useCuentasCobrar } from '@/lib/data/tesoreria';
import { useSession } from 'next-auth/react';
import {
  TrendingUp, TrendingDown, FileText, Package, AlertTriangle,
  Clock, CheckCircle2, XCircle, DollarSign,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const ETAPAS_COLORS: Record<string, string> = {
  prospeccion: '#6366f1', calificado: '#f59e0b', cotizacion_enviada: '#3b82f6',
  negociacion: '#8b5cf6', ganada: '#22c55e', perdida: '#ef4444',
};
const ETAPAS_LABELS: Record<string, string> = {
  prospeccion: 'Prospección', calificado: 'Calificado', cotizacion_enviada: 'Cotización Enviada',
  negociacion: 'Negociación', ganada: 'Ganada', perdida: 'Perdida',
};

function KpiCard({ title, value, sub, icon: Icon, trend, variant = 'default' }: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; trend?: { value: string; up: boolean };
  variant?: 'default' | 'danger' | 'warning';
}) {
  return (
    <Card className={variant === 'danger' ? 'border-destructive/30' : variant === 'warning' ? 'border-warning/30' : ''}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
            {trend && (
              <div className={`mt-1.5 flex items-center gap-1 text-xs ${trend.up ? 'text-success' : 'text-destructive'}`}>
                {trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {trend.value}
              </div>
            )}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            variant === 'danger' ? 'bg-destructive/10 text-destructive'
            : variant === 'warning' ? 'bg-warning/10 text-warning'
            : 'bg-primary/10 text-primary'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const dtes = useDtes();
  const dtesProveedor = useDtesProveedor();
  const oportunidades = useOportunidades();
  const productos = useProductos();
  const cxc = useCuentasCobrar();
  const { data: session } = useSession();
  const contexto = session?.user?.contexto;

  const now = new Date();
  const facturacionMes = dtes
    .filter((d) => d.estado !== 'anulado' && d.estado !== 'rechazado' && new Date(d.fechaEmision).getMonth() === now.getMonth() && new Date(d.fechaEmision).getFullYear() === now.getFullYear())
    .reduce((s, d) => s + (d.total > 0 ? d.total : 0), 0);
  const dealsGanados = oportunidades.filter((o) => o.etapa === 'ganada').length;
  const stockBajoMin = productos.filter((p) => p.estado === 'bajo_minimo' || p.estado === 'sin_stock').length;
  const cxcVencidas = cxc.filter((c) => c.aging === '+90' || c.aging === '61-90').length;
  const dtesRechazados = dtes.filter((d) => d.estado === 'rechazado');
  const pendienteAcuse = dtesProveedor.filter((d) => d.estado === 'pendiente_acuse');

  // Ventas últimos 6 meses derivadas de DTEs
  const ventasMensuales = useMemo(() => {
    const out: { mes: string; monto: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monto = dtes
        .filter((x) => x.total > 0 && x.estado !== 'anulado' && x.estado !== 'rechazado')
        .filter((x) => { const f = new Date(x.fechaEmision); return f.getMonth() === d.getMonth() && f.getFullYear() === d.getFullYear(); })
        .reduce((s, x) => s + x.total, 0);
      out.push({ mes: MESES[d.getMonth()], monto });
    }
    return out;
  }, [dtes]); // eslint-disable-line react-hooks/exhaustive-deps

  const pipelineData = Object.entries(
    oportunidades.reduce((acc, op) => {
      if (!acc[op.etapa]) acc[op.etapa] = { name: ETAPAS_LABELS[op.etapa], value: 0, monto: 0 };
      acc[op.etapa].value++;
      acc[op.etapa].monto += op.monto;
      return acc;
    }, {} as Record<string, { name: string; value: number; monto: number }>),
  ).map(([key, v]) => ({ ...v, color: ETAPAS_COLORS[key] }));

  // Actividad reciente derivada
  const actividades = useMemo(() => {
    const items: { fecha: Date; icon: React.ElementType; color: string; text: string }[] = [];
    dtes.forEach((d) => items.push({ fecha: new Date(d.fechaEmision), icon: FileText, color: 'text-primary', text: `DTE #${d.folio} emitido — ${d.clienteNombre} (${formatCLP(d.total)})` }));
    oportunidades.filter((o) => o.etapa === 'ganada').forEach((o) => items.push({ fecha: new Date(o.ultimaActividad), icon: CheckCircle2, color: 'text-success', text: `Oportunidad "${o.titulo}" ganada` }));
    productos.filter((p) => p.estado !== 'ok').forEach((p) => items.push({ fecha: now, icon: Package, color: 'text-warning', text: `Stock ${p.estado === 'sin_stock' ? 'agotado' : 'bajo mínimo'}: ${p.nombre}` }));
    return items.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 6);
  }, [dtes, oportunidades, productos]); // eslint-disable-line react-hooks/exhaustive-deps

  const hayDatos = dtes.length + oportunidades.length + productos.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{contexto?.plataformaNombre ?? 'Mi empresa'} · {formatDate(now)}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Facturación del mes" value={formatCLP(facturacionMes)} sub={`${MESES[now.getMonth()]} ${now.getFullYear()}`} icon={DollarSign} />
        <KpiCard title="Deals ganados" value={String(dealsGanados)} sub="Total" icon={CheckCircle2} />
        <KpiCard title="Stock bajo mínimo" value={String(stockBajoMin)} sub="Productos críticos" icon={Package} variant={stockBajoMin > 0 ? 'warning' : 'default'} />
        <KpiCard title="CxC vencidas" value={String(cxcVencidas)} sub="+61 días sin cobrar" icon={Clock} variant={cxcVencidas > 0 ? 'danger' : 'default'} />
      </div>

      {!hayDatos && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Tu plataforma está lista y vacía. A medida que crees clientes, cotizaciones, productos y emitas DTEs,
          este panel se irá llenando automáticamente.
        </div>
      )}

      {/* Alertas críticas */}
      {(dtesRechazados.length > 0 || pendienteAcuse.length > 0) && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Alertas críticas</h2>
          <div className="space-y-2">
            {dtesRechazados.map((dte) => (
              <div key={dte.id} className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <XCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">DTE #{dte.folio} rechazado — {dte.clienteNombre}</p>
                  <p className="text-xs text-muted-foreground">Emitido el {formatDate(dte.fechaEmision)} · {formatCLP(dte.total)}</p>
                </div>
                <Badge variant="destructive">Rechazado</Badge>
              </div>
            ))}
            {pendienteAcuse.map((dp) => {
              const dias = daysUntil(dp.fechaLimiteAcuse);
              return (
                <div key={dp.id} className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${dias <= 1 ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5'}`}>
                  <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${dias <= 1 ? 'text-destructive' : 'text-warning'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Acuse pendiente — {dp.proveedorNombre}</p>
                    <p className="text-xs text-muted-foreground">Folio #{dp.folio} · {formatCLP(dp.total)} · vence {formatDate(dp.fechaLimiteAcuse)}</p>
                  </div>
                  <Badge variant={dias <= 1 ? 'destructive' : 'warning'}>{dias <= 0 ? 'Vence hoy' : `${dias} días`}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold">Ventas mensuales</CardTitle>
            <p className="text-xs text-muted-foreground">Últimos 6 meses (DTEs emitidos)</p>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ventasMensuales} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: unknown) => [formatCLP(v as number), 'Ventas']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="monto" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold">Pipeline por etapa</CardTitle>
            <p className="text-xs text-muted-foreground">{oportunidades.length} oportunidades</p>
          </CardHeader>
          <CardContent className="pt-2">
            {pipelineData.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">Sin oportunidades aún</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {pipelineData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(v: unknown, _: unknown, p: any) => [`${v} deals · ${formatCLP(p?.payload?.monto ?? 0)}`, p?.payload?.name ?? '']}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {pipelineData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="flex-1 truncate text-muted-foreground">{d.name}</span>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Actividad reciente</CardTitle></CardHeader>
        <CardContent>
          {actividades.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
          ) : (
            <div className="space-y-3">
              {actividades.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <a.icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${a.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.fecha)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
