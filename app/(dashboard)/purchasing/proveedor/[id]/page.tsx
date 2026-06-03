'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useProveedor, useOrdenesByProveedorRut, useDtesByProveedorRut } from '@/lib/data/compras';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';

export default function ProveedorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const proveedor = useProveedor(id);
  const ocs = useOrdenesByProveedorRut(proveedor?.rut);
  const dtes = useDtesByProveedorRut(proveedor?.rut);

  if (!proveedor) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Proveedor no encontrado</p>
        <Button variant="outline" onClick={() => router.push('/purchasing')}><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Button>
      </div>
    );
  }

  const totalComprado = dtes.reduce((s, d) => s + d.total, 0);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/purchasing"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{proveedor.razonSocial}</h1>
          <p className="font-mono text-sm text-muted-foreground">{proveedor.rut || 'Sin RUT'}{proveedor.giro ? ` · ${proveedor.giro}` : ''}</p>
        </div>
        {proveedor.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="muted">Inactivo</Badge>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Contacto</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{proveedor.contactoNombre || '—'}</p>
            <p className="text-xs text-muted-foreground">{proveedor.contactoEmail || 'Sin email'}</p>
            <p className="text-xs text-muted-foreground">{proveedor.contactoTelefono || 'Sin teléfono'}</p>
            <p className="pt-1 text-xs text-muted-foreground">Condición de pago: <span className="text-foreground">{proveedor.condicionPago ?? '—'}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Resumen</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Órdenes de compra</span><span className="font-medium">{ocs.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">DTEs recibidos</span><span className="font-medium">{dtes.length}</span></div>
            <div className="flex justify-between border-t pt-1"><span className="text-muted-foreground">Total facturado</span><span className="font-bold">{formatCLP(totalComprado)}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Órdenes de compra ({ocs.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {ocs.length === 0 ? <p className="px-4 py-3 text-xs text-muted-foreground">Sin órdenes de compra.</p> : (
            <div className="divide-y">
              {ocs.map((o) => (
                <div key={o.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="font-mono text-xs">{o.numero} <span className="text-muted-foreground">· {formatDate(o.fechaEmision)}</span></span>
                  <span className="flex items-center gap-2 text-xs"><Badge variant="outline">{o.estado}</Badge><span className="font-medium">{formatCLP(o.total)}</span></span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">DTEs recibidos ({dtes.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {dtes.length === 0 ? <p className="px-4 py-3 text-xs text-muted-foreground">Sin DTEs recibidos.</p> : (
            <div className="divide-y">
              {dtes.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span>Folio #{d.folio} <span className="text-xs text-muted-foreground">· {formatDate(d.fechaEmision)}</span></span>
                  <span className="flex items-center gap-2 text-xs"><Badge variant="outline">{d.estado.replace(/_/g, ' ')}</Badge><span className="font-medium">{formatCLP(d.total)}</span></span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
