'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Ban, LinkIcon, User } from 'lucide-react';
import { toast } from 'sonner';
import { useDte, useOrdenVenta, useCotizacion, useMarcarDtePagado, useAnularDte } from '@/lib/data/ventas';
import { useClientes, nombreCliente } from '@/lib/data/clientes';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import type { EstadoDte, TipoDte } from '@/types';

const TIPO_LABEL: Record<TipoDte, string> = {
  33: 'Factura Afecta', 34: 'Factura Exenta', 39: 'Boleta', 52: 'Guía Despacho', 56: 'Nota Débito', 61: 'Nota Crédito',
};
const ESTADO_CONFIG: Record<EstadoDte, { label: string; variant: 'success' | 'destructive' | 'warning' | 'muted' | 'default' }> = {
  aceptado: { label: 'Aceptado', variant: 'success' }, pagado: { label: 'Pagado', variant: 'success' },
  pendiente: { label: 'Pendiente', variant: 'warning' }, enviado_sii: { label: 'Enviado SII', variant: 'warning' },
  rechazado: { label: 'Rechazado', variant: 'destructive' }, anulado: { label: 'Anulado', variant: 'muted' },
  borrador: { label: 'Borrador', variant: 'muted' },
};

export default function DteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const dte = useDte(id);
  const ov = useOrdenVenta(dte?.ordenVentaId);
  const cotizacion = useCotizacion(ov?.cotizacionId);
  const clientes = useClientes();
  const marcarPagado = useMarcarDtePagado();
  const anular = useAnularDte();

  if (!dte) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">DTE no encontrado</p>
        <Button variant="outline" onClick={() => router.push('/dte')}><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Button>
      </div>
    );
  }

  const cfg = ESTADO_CONFIG[dte.estado];
  const cliente = clientes.find((c) => c.rut && dte.clienteRut && c.rut === dte.clienteRut);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/dte"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">DTE #{dte.folio}</h1>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{TIPO_LABEL[dte.tipo]} · Emitido {formatDate(dte.fechaEmision)}</p>
        </div>
        <div className="flex gap-2">
          {dte.estado !== 'pagado' && dte.estado !== 'anulado' && (
            <Button size="sm" className="h-8 text-xs" onClick={() => {
              marcarPagado.mutate(dte.id, { onSuccess: () => toast.success('DTE marcado como pagado') });
            }}>
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />Marcar pagado
            </Button>
          )}
          {dte.estado !== 'anulado' && (
            <Button variant="outline" size="sm" className="h-8 text-xs text-destructive" onClick={() => {
              anular.mutate(dte.id, { onSuccess: () => toast('DTE anulado') });
            }}>
              <Ban className="mr-1 h-3.5 w-3.5" />Anular
            </Button>
          )}
        </div>
      </div>

      {/* Cliente + montos */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{dte.clienteNombre}</p>
            <p className="font-mono text-xs text-muted-foreground">{dte.clienteRut}</p>
            {cliente && (
              <Button variant="link" size="sm" className="h-auto px-0 text-xs" asChild>
                <Link href={`/crm/clientes/${cliente.id}`}><User className="mr-1 h-3 w-3" />Ver ficha del cliente</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Montos</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Neto</span><span>{formatCLP(dte.neto)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">IVA</span><span>{formatCLP(dte.iva)}</span></div>
            <div className="flex justify-between border-t pt-1 font-bold"><span>Total</span><span className="text-primary">{formatCLP(dte.total)}</span></div>
            {dte.fechaVencimiento && <p className="pt-1 text-xs text-muted-foreground">Vence {formatDate(dte.fechaVencimiento)}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Trazabilidad */}
      {(ov || cotizacion) && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><LinkIcon className="h-4 w-4" />Trazabilidad</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2 text-xs">
            {cotizacion && (
              <Link href="/dte/cotizaciones" className="rounded-md border bg-muted/40 px-3 py-1.5 font-mono hover:bg-muted">{cotizacion.numero}</Link>
            )}
            {cotizacion && <span className="text-muted-foreground">→</span>}
            {ov && (
              <Link href="/dte/ordenes" className="rounded-md border bg-muted/40 px-3 py-1.5 font-mono hover:bg-muted">{ov.numero}</Link>
            )}
            <span className="text-muted-foreground">→</span>
            <span className="rounded-md border border-primary bg-primary/10 px-3 py-1.5 font-mono text-primary">DTE #{dte.folio}</span>
          </CardContent>
        </Card>
      )}

      {/* Líneas */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Detalle</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-muted-foreground">Descripción</th>
                <th className="px-4 py-2 text-right text-xs text-muted-foreground">Cant.</th>
                <th className="px-4 py-2 text-right text-xs text-muted-foreground">P. Unit.</th>
                <th className="px-4 py-2 text-right text-xs text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dte.lineas.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2">{l.descripcion}</td>
                  <td className="px-4 py-2 text-right">{l.cantidad}</td>
                  <td className="px-4 py-2 text-right">{formatCLP(l.precioUnitario)}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCLP(l.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
