'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, FileText, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';
import { useOportunidad, setEtapaOportunidad } from '@/lib/data/crm';
import { useClientes } from '@/lib/data/clientes';
import { useCotizaciones } from '@/lib/data/ventas';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import type { EtapaPipeline } from '@/types';

const ETAPAS: { id: EtapaPipeline; label: string }[] = [
  { id: 'prospeccion', label: 'Prospección' }, { id: 'calificado', label: 'Calificado' },
  { id: 'cotizacion_enviada', label: 'Cotización Enviada' }, { id: 'negociacion', label: 'Negociación' },
  { id: 'ganada', label: 'Ganada' }, { id: 'perdida', label: 'Perdida' },
];
const selectClass = 'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm';

export default function OportunidadDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const op = useOportunidad(id);
  const clientes = useClientes();
  const cotizaciones = useCotizaciones();

  const cliente = clientes.find((c) => c.rut && op?.clienteRut && c.rut === op.clienteRut);
  const cots = useMemo(() => (op ? cotizaciones.filter((c) => c.clienteRut === op.clienteRut) : []), [cotizaciones, op]);

  if (!op) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Oportunidad no encontrada</p>
        <Button variant="outline" onClick={() => router.push('/crm/lista')}><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/crm/lista"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{op.titulo}</h1>
          <p className="text-sm text-muted-foreground">{op.clienteNombre} · creado {formatDate(op.createdAt)}</p>
        </div>
        <Badge variant={op.etapa === 'ganada' ? 'success' : op.etapa === 'perdida' ? 'destructive' : 'secondary'}>{op.etapa}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" className="h-8 text-xs" onClick={() => router.push(`/dte/nueva?clienteRut=${encodeURIComponent(op.clienteRut)}&oportunidadId=${encodeURIComponent(op.id)}`)}>
          <FileText className="mr-1 h-3.5 w-3.5" />Crear cotización
        </Button>
        {op.etapa !== 'ganada' && (
          <Button variant="outline" size="sm" className="h-8 text-xs text-success" onClick={() => { setEtapaOportunidad(op.id, 'ganada'); toast.success('Oportunidad ganada 🎉'); }}>
            <Trophy className="mr-1 h-3.5 w-3.5" />Marcar ganada
          </Button>
        )}
        {op.etapa !== 'perdida' && (
          <Button variant="outline" size="sm" className="h-8 text-xs text-destructive" onClick={() => { setEtapaOportunidad(op.id, 'perdida'); toast('Oportunidad marcada como perdida'); }}>
            <X className="mr-1 h-3.5 w-3.5" />Marcar perdida
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Datos</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span className="font-bold text-primary">{formatCLP(op.monto)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Probabilidad</span><span>{op.probabilidad}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vendedor</span><span>{op.vendedorNombre}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Última actividad</span><span>{formatDate(op.ultimaActividad)}</span></div>
            <div>
              <label className="text-xs text-muted-foreground">Etapa</label>
              <select className={selectClass} value={op.etapa} onChange={(e) => { setEtapaOportunidad(op.id, e.target.value as EtapaPipeline); toast.success('Etapa actualizada'); }}>
                {ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </div>
            {op.notas && <p className="border-t pt-2 text-xs text-muted-foreground">{op.notas}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{op.clienteNombre}</p>
            <p className="font-mono text-xs text-muted-foreground">{op.clienteRut}</p>
            {cliente && (
              <Button variant="link" size="sm" className="h-auto px-0 text-xs" asChild>
                <Link href={`/crm/clientes/${cliente.id}`}><User className="mr-1 h-3 w-3" />Ver ficha</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Cotizaciones del cliente ({cots.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {cots.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">Sin cotizaciones. Crea una con el botón de arriba.</p>
          ) : (
            <div className="divide-y">
              {cots.map((c) => (
                <Link key={c.id} href="/dte/cotizaciones" className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/40">
                  <span className="font-mono text-xs">{c.numero}</span>
                  <span className="flex items-center gap-2 text-xs"><Badge variant="outline">{c.estado}</Badge><span className="font-medium">{formatCLP(c.total)}</span></span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
