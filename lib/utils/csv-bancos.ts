/**
 * Parser CSV multi-banco para Chile.
 * Soporta: Santander, BCI, BancoEstado y formato genérico.
 * Auto-detecta separador y columnas por nombre.
 */

export interface LineaCartola {
  fecha: Date;
  descripcion: string;
  monto: number;        // positivo = abono, negativo = cargo
  tipo: 'abono' | 'cargo';
  referencia?: string;
  _raw: string;         // línea original para debug
}

export type FormatoBanco = 'santander' | 'bci' | 'bancostado' | 'auto';

// ── Utilidades ────────────────────────────────────────────────────────────────

function detectSeparador(header: string): ',' | ';' | '\t' {
  const counts = { ',': 0, ';': 0, '\t': 0 };
  for (const c of header) {
    if (c in counts) (counts as Record<string, number>)[c]++;
  }
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) as ',' | ';' | '\t';
}

/** Parsea monto chileno: "1.234.567" o "1234567" o "-150.000" */
function parseMonto(s: string): number {
  const cleaned = s.trim().replace(/\./g, '').replace(',', '.').replace(/\s/g, '');
  return parseFloat(cleaned) || 0;
}

/** Parsea fechas: dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd */
function parseFecha(s: string): Date | null {
  const t = s.trim();
  // dd/mm/yyyy o dd-mm-yyyy
  const dmy = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  // yyyy-mm-dd
  const ymd = t.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
}

/** Normaliza el nombre de columna para matching insensible a tildes/mayúsculas */
function normCol(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

const ALIAS_FECHA = ['fecha', 'date'];
const ALIAS_DESC  = ['descripcion', 'descripción', 'descripción movimiento', 'glosa', 'detalle', 'concepto'];
const ALIAS_CARGO = ['cargo', 'cargos', 'debito', 'débito', 'egreso', 'egresos'];
const ALIAS_ABONO = ['abono', 'abonos', 'credito', 'crédito', 'ingreso', 'ingresos'];
const ALIAS_MONTO = ['monto', 'importe', 'amount', 'valor'];
const ALIAS_REF   = ['n° documento', 'n documento', 'documento', 'num doc', 'referencia', 'ref', 'cheque'];

function findIdx(headers: string[], aliases: string[]): number {
  return headers.findIndex((h) => aliases.includes(normCol(h)));
}

// ── Parser principal ──────────────────────────────────────────────────────────

export function parsearCartola(csvText: string): LineaCartola[] {
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // Buscar la primera línea que parezca header (contiene "fecha" u otra col conocida)
  let headerIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const n = normCol(lines[i]);
    if (ALIAS_FECHA.some((a) => n.includes(a))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) headerIdx = 0; // fallback

  const sep = detectSeparador(lines[headerIdx]);
  const splitLine = (l: string) => l.split(sep).map((c) => c.replace(/^"|"$/g, '').trim());

  const headers = splitLine(lines[headerIdx]);
  const iFecha = findIdx(headers, ALIAS_FECHA);
  const iDesc  = findIdx(headers, ALIAS_DESC);
  const iCargo = findIdx(headers, ALIAS_CARGO);
  const iAbono = findIdx(headers, ALIAS_ABONO);
  const iMonto = findIdx(headers, ALIAS_MONTO);
  const iRef   = findIdx(headers, ALIAS_REF);

  const result: LineaCartola[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw || raw.startsWith('//') || raw.startsWith('#')) continue;

    const cols = splitLine(raw);
    if (cols.length < 2) continue;

    // Fecha
    const fechaRaw = iFecha >= 0 ? cols[iFecha] : cols[0];
    const fecha = parseFecha(fechaRaw);
    if (!fecha) continue; // línea no parseable como fecha → skip (totales, etc.)

    // Descripción
    const descripcion = (iDesc >= 0 ? cols[iDesc] : cols[1]) || 'Sin descripción';

    // Monto: puede venir como cargo/abono separados o columna única
    let monto = 0;
    if (iCargo >= 0 && iAbono >= 0) {
      const cargo = parseMonto(cols[iCargo] ?? '');
      const abono = parseMonto(cols[iAbono] ?? '');
      monto = abono !== 0 ? Math.abs(abono) : -Math.abs(cargo);
    } else if (iMonto >= 0) {
      monto = parseMonto(cols[iMonto] ?? '');
    } else {
      // Último recurso: buscar columna numérica > 0
      for (let c = cols.length - 1; c >= 0; c--) {
        const v = parseMonto(cols[c]);
        if (v !== 0) { monto = v; break; }
      }
    }
    if (monto === 0) continue;

    const referencia = iRef >= 0 ? cols[iRef] || undefined : undefined;

    result.push({
      fecha,
      descripcion: descripcion.slice(0, 300),
      monto,
      tipo: monto >= 0 ? 'abono' : 'cargo',
      referencia,
      _raw: raw,
    });
  }

  return result;
}
