'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockLeads } from '@/lib/mock/oportunidades';
import { formatDate } from '@/lib/utils/dates';
import { Plus, ArrowRight } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function LeadsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{mockLeads.length} leads registrados</p>
        </div>
        <Button size="sm" className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Nuevo lead</Button>
      </div>
      <DataTable
        data={mockLeads}
        searchPlaceholder="Buscar leads..."
        getRowId={(r) => r.id}
        columns={[
          { key: 'nombre', header: 'Nombre', sortable: true },
          { key: 'empresa', header: 'Empresa', sortable: true },
          { key: 'rut', header: 'RUT', render: (v) => v ? String(v) : '—' },
          { key: 'email', header: 'Email', render: (v) => v ? <span className="text-xs">{String(v)}</span> : '—' },
          { key: 'fuente', header: 'Fuente', render: (v) => <Badge variant="secondary">{String(v)}</Badge> },
          { key: 'createdAt', header: 'Fecha', sortable: true, render: (v) => formatDate(v as Date) },
        ]}
        actions={(row) => (
          <>
            <DropdownMenuItem className="text-xs">
              <ArrowRight className="h-3.5 w-3.5 mr-2" />Convertir a oportunidad
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Ver detalle</DropdownMenuItem>
          </>
        )}
      />
    </div>
  );
}
