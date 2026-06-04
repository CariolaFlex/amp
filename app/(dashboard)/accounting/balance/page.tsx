'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCLP } from '@/lib/utils/clp';
import { Download } from 'lucide-react';
import { exportarBalanceExcel } from '@/lib/utils/export-excel';
import { descargarBalancePdf } from '@/lib/utils/export-pdf';

const balanceData = [
  { cuenta: '1110001', nombre: 'Clientes',             dEnt: 22200000, hEnt: 0,          dSal: 22200000, hSal: 0          },
  { cuenta: '1130001', nombre: 'IVA Crédito Fiscal',   dEnt: 768000,   hEnt: 0,          dSal: 768000,   hSal: 0          },
  { cuenta: '2110001', nombre: 'Proveedores',           dEnt: 0,        hEnt: 4800000,    dSal: 0,        hSal: 4800000    },
  { cuenta: '2210001', nombre: 'IVA Débito Fiscal',    dEnt: 0,        hEnt: 4544538,    dSal: 0,        hSal: 4544538    },
  { cuenta: '4110001', nombre: 'Ingresos por Ventas',  dEnt: 0,        hEnt: 18655462,   dSal: 0,        hSal: 18655462   },
  { cuenta: '5110001', nombre: 'Costo de Ventas',      dEnt: 4032000,  hEnt: 0,          dSal: 4032000,  hSal: 0          },
];

export default function BalancePage() {
  const totDEnt = balanceData.reduce((s, r) => s + r.dEnt, 0);
  const totHEnt = balanceData.reduce((s, r) => s + r.hEnt, 0);
  const totDSal = balanceData.reduce((s, r) => s + r.dSal, 0);
  const totHSal = balanceData.reduce((s, r) => s + r.hSal, 0);

  const rowsExport = balanceData.map((r) => ({
    ...r,
    perdida:  r.dSal > 0 && r.cuenta.startsWith('5') ? r.dSal : 0,
    ganancia: r.hSal > 0 && r.cuenta.startsWith('4') ? r.hSal : 0,
    activo:   r.dSal > 0 && r.cuenta.startsWith('1') ? r.dSal : 0,
    pasivo:   r.hSal > 0 && r.cuenta.startsWith('2') ? r.hSal : 0,
  }));
  const exportParams = { periodo: 'Mayo 2026', empresaNombre: 'Constructora Los Andes SpA', rows: rowsExport };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Balance de 8 Columnas</h1>
          <p className="text-sm text-muted-foreground">Mayo 2026 — Constructora Los Andes SpA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => exportarBalanceExcel(exportParams)}>
            <Download className="h-3.5 w-3.5 mr-1" />Excel
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => descargarBalancePdf(exportParams)}>
            <Download className="h-3.5 w-3.5 mr-1" />PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium" rowSpan={2}>Cuenta</th>
                <th className="px-3 py-2.5 text-left font-medium" rowSpan={2}>Nombre</th>
                <th className="px-3 py-2.5 text-center font-medium border-l" colSpan={2}>Sumas</th>
                <th className="px-3 py-2.5 text-center font-medium border-l" colSpan={2}>Saldos</th>
                <th className="px-3 py-2.5 text-center font-medium border-l" colSpan={2}>Resultado</th>
                <th className="px-3 py-2.5 text-center font-medium border-l" colSpan={2}>Balance</th>
              </tr>
              <tr>
                {['Debe','Haber','Deudor','Acreedor','Pérd.','Ganc.','Activo','Pasivo'].map((h, i) => (
                  <th key={h} className={`px-3 py-2 text-right text-muted-foreground font-medium ${i % 2 === 0 && i > 1 ? 'border-l' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {balanceData.map(row => {
                const esActivo = row.dSal > 0 && row.cuenta.startsWith('1');
                const esPasivo = row.hSal > 0 && row.cuenta.startsWith('2');
                const esIngreso = row.hSal > 0 && row.cuenta.startsWith('4');
                const esCosto = row.dSal > 0 && row.cuenta.startsWith('5');
                return (
                  <tr key={row.cuenta} className="hover:bg-muted/20">
                    <td className="px-3 py-2.5 font-mono">{row.cuenta}</td>
                    <td className="px-3 py-2.5">{row.nombre}</td>
                    <td className="px-3 py-2.5 text-right border-l">{row.dEnt > 0 ? formatCLP(row.dEnt) : '—'}</td>
                    <td className="px-3 py-2.5 text-right">{row.hEnt > 0 ? formatCLP(row.hEnt) : '—'}</td>
                    <td className="px-3 py-2.5 text-right border-l">{row.dSal > 0 ? formatCLP(row.dSal) : '—'}</td>
                    <td className="px-3 py-2.5 text-right">{row.hSal > 0 ? formatCLP(row.hSal) : '—'}</td>
                    <td className="px-3 py-2.5 text-right border-l text-destructive">{esCosto ? formatCLP(row.dSal) : '—'}</td>
                    <td className="px-3 py-2.5 text-right text-success">{esIngreso ? formatCLP(row.hSal) : '—'}</td>
                    <td className="px-3 py-2.5 text-right border-l">{esActivo ? formatCLP(row.dSal) : '—'}</td>
                    <td className="px-3 py-2.5 text-right">{esPasivo ? formatCLP(row.hSal) : '—'}</td>
                  </tr>
                );
              })}
              <tr className="bg-muted/40 font-bold border-t-2">
                <td colSpan={2} className="px-3 py-2.5">TOTALES</td>
                <td className="px-3 py-2.5 text-right border-l">{formatCLP(totDEnt)}</td>
                <td className="px-3 py-2.5 text-right">{formatCLP(totHEnt)}</td>
                <td className="px-3 py-2.5 text-right border-l">{formatCLP(totDSal)}</td>
                <td className="px-3 py-2.5 text-right">{formatCLP(totHSal)}</td>
                <td className="px-3 py-2.5 text-right border-l text-destructive">{formatCLP(4032000)}</td>
                <td className="px-3 py-2.5 text-right text-success">{formatCLP(18655462)}</td>
                <td className="px-3 py-2.5 text-right border-l">{formatCLP(22968000)}</td>
                <td className="px-3 py-2.5 text-right">{formatCLP(9344538)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
