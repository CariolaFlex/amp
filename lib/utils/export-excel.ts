/**
 * Exportación a Excel con SheetJS (dynamic import — no SSR).
 * Incluye BOM y formato chileno.
 */

/** Exporta una tabla genérica (array de filas objeto) a .xlsx */
export async function exportarExcel(params: {
  columnas: string[];
  filas: (string | number | null | undefined)[][];
  nombreArchivo: string;
  nombreHoja?: string;
}) {
  const XLSX = await import('xlsx');

  const data = [params.columnas, ...params.filas];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Autowidth básico
  const maxWidths = params.columnas.map((c, i) => {
    const max = params.filas.reduce((m, r) => {
      const v = String(r[i] ?? '');
      return Math.max(m, v.length);
    }, c.length);
    return { wch: Math.min(max + 2, 40) };
  });
  ws['!cols'] = maxWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, params.nombreHoja ?? 'Hoja1');
  XLSX.writeFile(wb, `${params.nombreArchivo}.xlsx`);
}

/** Exporta el Balance de 8 columnas a Excel. */
export async function exportarBalanceExcel(params: {
  periodo: string;
  empresaNombre: string;
  rows: Array<{
    cuenta: string; nombre: string;
    dEnt: number; hEnt: number;
    dSal: number; hSal: number;
    perdida: number; ganancia: number;
    activo: number; pasivo: number;
  }>;
}) {
  const fmt = (n: number) => (n > 0 ? n : 0);

  await exportarExcel({
    columnas: ['Cuenta', 'Nombre', 'Debe', 'Haber', 'Deudor', 'Acreedor', 'Pérdida', 'Ganancia', 'Activo', 'Pasivo'],
    filas: params.rows.map((r) => [
      r.cuenta, r.nombre,
      fmt(r.dEnt), fmt(r.hEnt),
      fmt(r.dSal), fmt(r.hSal),
      fmt(r.perdida), fmt(r.ganancia),
      fmt(r.activo), fmt(r.pasivo),
    ]),
    nombreArchivo: `Balance_8col_${params.periodo}`,
    nombreHoja: 'Balance',
  });
}

/** Exporta el Libro Diario a Excel. */
export async function exportarLibroDiarioExcel(params: {
  periodo: string;
  asientos: Array<{
    numero: number;
    fecha: Date | string;
    glosa: string;
    cuentaCodigo: string;
    cuentaNombre: string;
    debe: number;
    haber: number;
  }>;
}) {
  await exportarExcel({
    columnas: ['N°', 'Fecha', 'Glosa', 'Código', 'Cuenta', 'Debe', 'Haber'],
    filas: params.asientos.map((a) => [
      a.numero,
      new Date(a.fecha).toLocaleDateString('es-CL'),
      a.glosa,
      a.cuentaCodigo,
      a.cuentaNombre,
      a.debe > 0 ? a.debe : 0,
      a.haber > 0 ? a.haber : 0,
    ]),
    nombreArchivo: `LibroDiario_${params.periodo}`,
    nombreHoja: 'Libro Diario',
  });
}
