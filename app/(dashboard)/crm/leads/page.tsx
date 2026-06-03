'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLeads, leadsCol } from '@/lib/data/crm';
import { NuevoLeadDialog } from '@/components/crm/NuevoLeadDialog';
import { NuevaOportunidadDialog } from '@/components/crm/NuevaOportunidadDialog';
import { formatDate } from '@/lib/utils/dates';
import { Plus, ArrowRight, Trash2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { Lead } from '@/types';

export default function LeadsPage() {
  const leads = useLeads();
  const [leadOpen, setLeadOpen] = useState(false);
  const [convertir, setConvertir] = useState<Lead | null>(null);

  async function eliminar(lead: Lead) {
    await leadsCol.remove(lead.id);
    toast.success('Lead eliminado');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{leads.length} leads registrados</p>
        </div>
        <Button size="sm" className="h-8 text-xs" onClick={() => setLeadOpen(true)}><Plus className="mr-1 h-3.5 w-3.5" />Nuevo lead</Button>
      </div>

      <NuevoLeadDialog open={leadOpen} onOpenChange={setLeadOpen} />
      <NuevaOportunidadDialog
        open={!!convertir}
        onOpenChange={(v) => !v && setConvertir(null)}
        defaults={convertir ? {
          titulo: `Oportunidad — ${convertir.empresa || convertir.nombre}`,
          clienteNombre: convertir.empresa || convertir.nombre,
          clienteRut: convertir.rut ?? '',
        } : undefined}
      />

      {leads.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Aún no hay leads. Crea el primero con <span className="font-medium text-foreground">Nuevo lead</span>.
        </div>
      ) : (
        <DataTable
          data={leads}
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
              <DropdownMenuItem className="text-xs" onClick={() => setConvertir(row)}>
                <ArrowRight className="mr-2 h-3.5 w-3.5" />Convertir a oportunidad
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-destructive" onClick={() => eliminar(row)}>
                <Trash2 className="mr-2 h-3.5 w-3.5" />Eliminar
              </DropdownMenuItem>
            </>
          )}
        />
      )}
    </div>
  );
}
