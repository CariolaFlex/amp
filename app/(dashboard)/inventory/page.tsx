'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProductos } from '@/lib/data/inventory';
import { NuevoProductoDialog } from '@/components/inventory/NuevoProductoDialog';
import { AjusteStockDialog } from '@/components/inventory/AjusteStockDialog';
import { formatCLP } from '@/lib/utils/clp';
import type { EstadoStock, Producto } from '@/types';
import { Plus, AlertTriangle, Package, XCircle } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STOCK_CONFIG: Record<EstadoStock, { label: string; variant: 'success' | 'warning' | 'destructive'; icon: React.ElementType }> = {
  ok: { label: 'OK', variant: 'success', icon: Package },
  bajo_minimo: { label: 'Bajo mínimo', variant: 'warning', icon: AlertTriangle },
  sin_stock: { label: 'Sin stock', variant: 'destructive', icon: XCircle },
};

export default function InventoryPage() {
  const router = useRouter();
  const productos = useProductos();
  const [categoriaFilter, setCategoriaFilter] = useState<string>('Todos');
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [ajustar, setAjustar] = useState<Producto | null>(null);

  const categorias = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria)))];
  const filtered = categoriaFilter === 'Todos' ? productos : productos.filter(p => p.categoria === categoriaFilter);

  const okCount = productos.filter(p => p.estado === 'ok').length;
  const warnCount = productos.filter(p => p.estado === 'bajo_minimo').length;
  const critCount = productos.filter(p => p.estado === 'sin_stock').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Inventario</h1>
          <p className="text-sm text-muted-foreground">{productos.length} productos en catálogo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
            <Link href="/inventory/movimientos">Movimientos</Link>
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => setNuevoOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />Nuevo producto</Button>
        </div>
      </div>

      <NuevoProductoDialog open={nuevoOpen} onOpenChange={setNuevoOpen} />
      <AjusteStockDialog producto={ajustar} onClose={() => setAjustar(null)} />

      {/* Semáforo */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-success/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-success flex-shrink-0" />
            <div>
              <p className="text-xl font-bold">{okCount}</p>
              <p className="text-xs text-muted-foreground">En stock</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-warning flex-shrink-0" />
            <div>
              <p className="text-xl font-bold">{warnCount}</p>
              <p className="text-xs text-muted-foreground">Bajo mínimo</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-destructive flex-shrink-0" />
            <div>
              <p className="text-xl font-bold">{critCount}</p>
              <p className="text-xs text-muted-foreground">Sin stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {categorias.map(cat => (
          <Button key={cat} variant={categoriaFilter === cat ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setCategoriaFilter(cat)}>{cat}</Button>
        ))}
      </div>

      <DataTable
        data={filtered}
        getRowId={(r) => r.id}
        searchPlaceholder="Buscar por SKU o nombre..."
        exportable
        columns={[
          { key: 'sku', header: 'SKU', width: '100px', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
          { key: 'nombre', header: 'Producto', sortable: true },
          { key: 'categoria', header: 'Categoría' },
          { key: 'stockDisponible', header: 'Disponible', align: 'right', sortable: true, render: (v, row) => <span className={`font-medium ${row.estado === 'sin_stock' ? 'text-destructive' : row.estado === 'bajo_minimo' ? 'text-warning' : ''}`}>{String(v)} {row.unidad}</span> },
          { key: 'stockMinimo', header: 'Mín.', align: 'right', render: (v, row) => <span className="text-muted-foreground">{String(v)} {row.unidad}</span> },
          { key: 'precioVenta', header: 'Precio Venta', align: 'right', sortable: true, render: (v) => formatCLP(v as number) },
          { key: 'costoPMP', header: 'Costo PMP', align: 'right', render: (v) => <span className="text-muted-foreground">{formatCLP(v as number)}</span> },
          { key: 'estado', header: 'Estado', render: (v) => {
            const cfg = STOCK_CONFIG[v as EstadoStock];
            return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
          }},
        ]}
        rowClassName={(row) => row.estado === 'sin_stock' ? 'bg-destructive/5' : row.estado === 'bajo_minimo' ? 'bg-warning/5' : undefined}
        emptyMessage="Aún no hay productos. Crea el primero con «Nuevo producto»."
        onRowClick={(row) => router.push(`/inventory/${row.id}`)}
        actions={(row) => (
          <>
            <DropdownMenuItem className="text-xs" onClick={() => router.push(`/inventory/${row.id}`)}>Ver detalle</DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={() => setAjustar(row)}>Ajustar stock</DropdownMenuItem>
          </>
        )}
      />
    </div>
  );
}
