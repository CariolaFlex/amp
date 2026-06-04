/**
 * Generador PDF con jsPDF (dynamic import — no SSR).
 * Sin autotable — dibuja manualmente para evitar dependencias extra.
 */

import type { Dte } from '@/types';

function fCLP(n: number): string {
  return '$ ' + Math.round(n).toLocaleString('es-CL');
}
function fFecha(d: Date | string | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-CL');
}

/** Genera y descarga un PDF del DTE. */
export async function descargarDtePdf(dte: Dte, empresaNombre: string, empresaRut: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210;
  const M = 15; // margen
  let y = M;

  const TIPO_LABEL: Record<number, string> = {
    33: 'FACTURA ELECTRÓNICA AFECTA',
    34: 'FACTURA ELECTRÓNICA EXENTA',
    39: 'BOLETA ELECTRÓNICA',
    52: 'GUÍA DE DESPACHO ELECTRÓNICA',
    56: 'NOTA DE DÉBITO ELECTRÓNICA',
    61: 'NOTA DE CRÉDITO ELECTRÓNICA',
  };

  // ── Encabezado empresa (izquierda) ──────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(empresaNombre, M, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUT: ${empresaRut}`, M, y);
  y += 5;

  // ── Recuadro tipo DTE (derecha) — estilo SII ────────────────
  const boxX = W - M - 60;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(boxX, M - 4, 60, 24);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const tipoLabel = TIPO_LABEL[dte.tipo] ?? `DTE TIPO ${dte.tipo}`;
  doc.text(tipoLabel, boxX + 30, M + 2, { align: 'center', maxWidth: 58 });
  doc.setFontSize(14);
  doc.text(`N° ${dte.folio}`, boxX + 30, M + 10, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`S.I.I. - Región Metropolitana`, boxX + 30, M + 17, { align: 'center' });

  y = M + 28;
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;

  // ── Datos receptor ──────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEPTOR', M, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Razón Social: ${dte.clienteNombre}`, M, y); y += 5;
  doc.text(`RUT: ${dte.clienteRut}`, M, y);
  doc.text(`Emisión: ${fFecha(dte.fechaEmision)}`, W / 2, y);
  y += 5;
  if (dte.fechaVencimiento) {
    doc.text(`Vencimiento: ${fFecha(dte.fechaVencimiento)}`, M, y); y += 5;
  }
  y += 3;
  doc.line(M, y, W - M, y);
  y += 6;

  // ── Tabla de líneas ─────────────────────────────────────────
  const COL = { desc: M, cant: 110, punit: 140, total: 170 };
  const ROW_H = 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(M, y - 4, W - 2 * M, ROW_H, 'F');
  doc.text('Descripción',  COL.desc,  y);
  doc.text('Cant.',        COL.cant,  y);
  doc.text('P. Unitario',  COL.punit, y);
  doc.text('Total',        COL.total, y);
  y += ROW_H;

  doc.setFont('helvetica', 'normal');
  const lineas = dte.lineas ?? [];
  lineas.forEach((l) => {
    if (y > 260) { doc.addPage(); y = M + 10; }
    doc.text(l.descripcion.slice(0, 55), COL.desc, y);
    doc.text(String(l.cantidad),         COL.cant,  y);
    doc.text(fCLP(l.precioUnitario),     COL.punit, y);
    doc.text(fCLP(l.total),              COL.total, y);
    y += ROW_H;
  });

  if (lineas.length === 0) {
    doc.setTextColor(150);
    doc.text('Sin líneas de detalle', COL.desc, y);
    doc.setTextColor(0);
    y += ROW_H;
  }

  y += 3;
  doc.line(M, y, W - M, y);
  y += 6;

  // ── Totales ─────────────────────────────────────────────────
  const TX = W - M - 50;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Neto:',  TX, y);  doc.text(fCLP(dte.neto),  W - M, y, { align: 'right' }); y += 5;
  doc.text('IVA (19%):',  TX, y);  doc.text(fCLP(dte.iva),   W - M, y, { align: 'right' }); y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL:',  TX, y);  doc.text(fCLP(dte.total), W - M, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // ── Pie ─────────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(130);
  doc.text(
    'Documento Tributario Electrónico — Timbre Electrónico SII',
    W / 2, 287,
    { align: 'center' },
  );
  doc.setTextColor(0);

  doc.save(`DTE_${dte.tipo}_${dte.folio}.pdf`);
}

/** Genera y descarga el Balance de 8 columnas como PDF. */
export async function descargarBalancePdf(params: {
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
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const W = 297;
  const M = 10;
  let y = M;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BALANCE DE 8 COLUMNAS', M, y); y += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${params.empresaNombre} — ${params.periodo}`, M, y); y += 8;

  const cols = [
    { label: 'Cuenta',     x: M,   w: 20 },
    { label: 'Nombre',     x: 32,  w: 45 },
    { label: 'Debe',       x: 80,  w: 28 },
    { label: 'Haber',      x: 110, w: 28 },
    { label: 'Deudor',     x: 140, w: 28 },
    { label: 'Acreedor',   x: 170, w: 28 },
    { label: 'Pérdida',    x: 200, w: 28 },
    { label: 'Ganancia',   x: 230, w: 28 },
    { label: 'Activo',     x: 260, w: 28 },
    // Pasivo omitido por espacio — entra si el papel lo permite
  ];

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(230, 230, 230);
  doc.rect(M, y - 4, W - 2 * M, 6, 'F');
  cols.forEach((c) => doc.text(c.label, c.x, y));
  y += 6;

  doc.setFont('helvetica', 'normal');
  params.rows.forEach((r) => {
    if (y > 195) { doc.addPage(); y = M + 10; }
    doc.text(r.cuenta,                cols[0].x, y);
    doc.text(r.nombre.slice(0, 22),   cols[1].x, y);
    doc.text(r.dEnt   > 0 ? fCLP(r.dEnt)    : '—', cols[2].x, y);
    doc.text(r.hEnt   > 0 ? fCLP(r.hEnt)    : '—', cols[3].x, y);
    doc.text(r.dSal   > 0 ? fCLP(r.dSal)    : '—', cols[4].x, y);
    doc.text(r.hSal   > 0 ? fCLP(r.hSal)    : '—', cols[5].x, y);
    doc.text(r.perdida > 0 ? fCLP(r.perdida) : '—', cols[6].x, y);
    doc.text(r.ganancia > 0 ? fCLP(r.ganancia) : '—', cols[7].x, y);
    doc.text(r.activo > 0 ? fCLP(r.activo)  : '—', cols[8].x, y);
    y += 5;
  });

  doc.line(M, y, W - M, y); y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('TOTALES', M, y);
  // (totales se calculan externamente; aquí solo dejamos espacio)

  doc.save(`Balance_8col_${params.periodo}.pdf`);
}
