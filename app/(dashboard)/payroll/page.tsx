'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useEmpleados, useBhe } from '@/lib/data/rrhh';
import { NuevoEmpleadoDialog } from '@/components/payroll/NuevoEmpleadoDialog';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const CONTRATO_LABEL = {
  indefinido: 'Indefinido',
  plazo_fijo: 'Plazo Fijo',
  obra_faena: 'Obra / Faena',
} as const;

export default function PayrollPage() {
  const empleados = useEmpleados();
  const bhes = useBhe();
  const [nuevoOpen, setNuevoOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">RRHH</h1>
          <p className="text-sm text-muted-foreground">Empleados, liquidaciones y boletas de honorarios</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" asChild><Link href="/payroll/bhe"><Plus className="h-3.5 w-3.5 mr-1" />Nueva BHE</Link></Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => setNuevoOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />Nuevo empleado</Button>
        </div>
      </div>

      <NuevoEmpleadoDialog open={nuevoOpen} onOpenChange={setNuevoOpen} />

      {/* Estado nómina */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-warning/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Nómina Mayo 2026</p>
            <Badge variant="warning" className="mt-1">Pendiente</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Empleados activos</p>
            <p className="text-2xl font-bold">{empleados.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Boletas de honorarios</p>
            <p className="text-2xl font-bold">{bhes.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="empleados">
        <TabsList>
          <TabsTrigger value="empleados" className="text-xs">Empleados</TabsTrigger>
          <TabsTrigger value="bhe" className="text-xs">Boletas Honorarios (BHE)</TabsTrigger>
        </TabsList>

        <TabsContent value="empleados">
          <DataTable
            data={empleados}
            getRowId={(r) => r.id}
            searchPlaceholder="Buscar empleados..."
            emptyMessage="Aún no hay empleados. Crea el primero con «Nuevo empleado»."
            columns={[
              { key: 'rut', header: 'RUT', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
              { key: 'nombre', header: 'Nombre', sortable: true },
              { key: 'cargo', header: 'Cargo' },
              { key: 'contrato', header: 'Contrato', render: (v) => <Badge variant="secondary">{CONTRATO_LABEL[v as keyof typeof CONTRATO_LABEL]}</Badge> },
              { key: 'sueldoBase', header: 'Sueldo Base', align: 'right', sortable: true, render: (v) => formatCLP(v as number) },
              { key: 'banco', header: 'Banco' },
              { key: 'fechaIngreso', header: 'Ingreso', render: (v) => formatDate(v as Date) },
            ]}
          />
        </TabsContent>

        <TabsContent value="bhe">
          <DataTable
            data={bhes}
            getRowId={(r) => r.id}
            emptyMessage="Sin boletas de honorarios. Regístralas en «Nueva BHE»."
            columns={[
              { key: 'rut', header: 'RUT', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
              { key: 'nombre', header: 'Nombre', sortable: true },
              { key: 'periodo', header: 'Período' },
              { key: 'montoBruto', header: 'Monto Bruto', align: 'right', render: (v) => formatCLP(v as number) },
              { key: 'retencion', header: 'Retención 15.25%', align: 'right', render: (v) => <span className="text-destructive">{formatCLP(v as number)}</span> },
              { key: 'montoLiquido', header: 'Líquido', align: 'right', render: (v) => <span className="font-bold">{formatCLP(v as number)}</span> },
              { key: 'fecha', header: 'Fecha', render: (v) => formatDate(v as Date) },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
