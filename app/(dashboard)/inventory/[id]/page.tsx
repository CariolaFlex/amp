'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, SlidersHorizontal, Receipt } from 'lucide-react';
import { useProducto, useMovimientosByProducto } from '@/lib/data/inventory';
import { useDtes } from '@/lib/data/ventas';
import { AjusteStockDialog } from '@/components/inventory/AjusteStockDialog';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import type { EstadoStock } from '@/types';

const ESTADO: Record<EstadoStock, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  ok: { label: 'OK', variant: 'success' }, bajo_minimo: { label: 'Bajo mínimo', variant: 'warning' }, sin_stock: { label: 'Sin stock', variant: 'destructive' },
};

export default function ProductoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const producto = useProducto(id);
  const movimientos = useMovimientosByProducto(id);
  const dtes = useDtes();
  const [ajustar, setAjustar] = useState(false);

  const dtesConProducto = useMemo(
    () => dtes.filter((d) => d.lineas.some((l) => l.productoId === id)),
    [dtes, id],
  );

  if (!producto) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Producto no encontrado</p>
        <Button variant="outline" onClick={() => router.push('/inventory')}><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Button>
      </div>
    );
  }

  const cfg = ESTADO[producto.estado];
  const movsOrden = [...movimientos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/inventory"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{producto.nombre}</h1>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <p className="font-mono text-sm text-muted-foreground">{producto.sku} · {producto.categoria}</p>
        </div>
        <Button size="sm" className="h-8 text-xs" onClick={() => setAjustar(true)}><SlidersHorizontal className="mr-1 h-3.5 w-3.5" />Ajustar stock</Button>
      </div>

      <AjusteStockDialog producto={ajustar ? producto : null} onClose={() => setAjustar(false)} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Disponible</p><p className="text-lg font-bold">{producto.stockDisponible} {producto.unidad}</p></div>
        <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Mínimo</p><p className="text-lg font-bold">{producto.stockMinimo} {producto.unidad}</p></div>
        <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Precio venta</p><p className="text-lg font-bold">{formatCLP(producto.precioVenta)}</p></div>
        <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Costo PMP</p><p className="text-lg font-bold">{formatCLP(producto.costoPMP)}</p></div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Movimientos de stock ({movsOrden.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {movsOrden.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">Sin movimientos.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-muted-foreground">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs text-muted-foreground">Tipo</th>
                  <th className="px-4 py-2 text-left text-xs text-muted-foreground">Motivo</th>
                  <th className="px-4 py-2 text-right text-xs text-muted-foreground">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movsOrden.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2 text-xs">{formatDate(m.fecha)}</td>
                    <td className="px-4 py-2"><Badge variant={m.tipo === 'entrada' ? 'success' : m.tipo === 'salida' ? 'destructive' : 'warning'} className="text-[10px]">{m.tipo}</Badge></td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{m.motivo ?? '—'}</td>
                    <td className={`px-4 py-2 text-right font-medium ${m.cantidad < 0 ? 'text-destructive' : 'text-success'}`}>{m.cantidad > 0 ? '+' : ''}{m.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Receipt className="h-4 w-4" />Vendido en DTEs ({dtesConProducto.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {dtesConProducto.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">Aún no se ha vendido en ningún DTE.</p>
          ) : (
            <div className="divide-y">
              {dtesConProducto.map((d) => (
                <Link key={d.id} href={`/dte/${d.id}`} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/40">
                  <span>DTE #{d.folio} <span className="text-xs text-muted-foreground">· {d.clienteNombre}</span></span>
                  <span className="font-medium">{formatCLP(d.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
