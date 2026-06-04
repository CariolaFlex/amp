/**
 * Parser CSV de nómina para Buk y Talana (y formato genérico).
 * Auto-detecta separador y columnas por nombre.
 */

export interface EmpleadoCSV {
  rut: string;
  nombre: string;
  cargo: string;
  contrato: string;    // 'indefinido' | 'plazo_fijo' | 'obra_faena'
  banco: string;
  numeroCuenta: string;
  sueldoBase: number;
  fechaIngreso: string; // ISO date string
  _fila: number;        // número de fila original
}

function detectSep(header: string): ',' | ';' | '\t' {
  const counts = { ',': 0, ';': 0, '\t': 0 };
  for (const c of header) { if (c in counts) (counts as Record<string, number>)[c]++; }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as ',' | ';' | '\t';
}

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

function parseFecha(s: string): string {
  const t = s.trim();
  // dd/mm/yyyy
  const dmy = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`;
  // yyyy-mm-dd ya está bien
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  return new Date().toISOString().slice(0, 10);
}

function parseSueldo(s: string): number {
  return parseInt(s.replace(/\./g, '').replace(',', '.').replace(/[^0-9]/g, ''), 10) || 0;
}

function normalizeContrato(s: string): string {
  const n = norm(s);
  if (n.includes('plazo') || n.includes('fijo')) return 'plazo_fijo';
  if (n.includes('obra') || n.includes('faena')) return 'obra_faena';
  return 'indefinido';
}

const ALIAS: Record<string, string[]> = {
  rut:          ['rut', 'run', 'id tributario'],
  nombreComp:   ['nombre completo', 'nombre y apellido'],
  nombres:      ['nombres', 'nombre'],
  apellidoPat:  ['apellido paterno', 'apellido 1', 'primer apellido'],
  apellidoMat:  ['apellido materno', 'apellido 2', 'segundo apellido'],
  cargo:        ['cargo', 'puesto', 'funcion'],
  contrato:     ['tipo contrato', 'tipo de contrato', 'contrato'],
  banco:        ['banco', 'banco de pago'],
  cuenta:       ['cuenta', 'n° cuenta', 'numero cuenta', 'n cuenta', 'num cuenta'],
  sueldo:       ['sueldo base', 'sueldo', 'renta', 'remuneracion', 'salario'],
  ingreso:      ['fecha ingreso', 'ingreso', 'fecha de ingreso'],
};

function findIdx(headers: string[], aliases: string[]): number {
  return headers.findIndex(h => aliases.includes(norm(h)));
}

export function parsearNominaCSV(csv: string): { empleados: EmpleadoCSV[]; errores: string[] } {
  const lines = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // Buscar header
  let headerIdx = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const l = norm(lines[i]);
    if (l.includes('rut') || l.includes('nombre') || l.includes('run')) { headerIdx = i; break; }
  }

  const sep = detectSep(lines[headerIdx]);
  const split = (l: string) => l.split(sep).map(c => c.replace(/^"|"$/g, '').trim());
  const headers = split(lines[headerIdx]);

  const iRut         = findIdx(headers, ALIAS.rut);
  const iNombreComp  = findIdx(headers, ALIAS.nombreComp);
  const iNombres     = findIdx(headers, ALIAS.nombres);
  const iApellidoPat = findIdx(headers, ALIAS.apellidoPat);
  const iApellidoMat = findIdx(headers, ALIAS.apellidoMat);
  const iCargo       = findIdx(headers, ALIAS.cargo);
  const iContrato    = findIdx(headers, ALIAS.contrato);
  const iBanco       = findIdx(headers, ALIAS.banco);
  const iCuenta      = findIdx(headers, ALIAS.cuenta);
  const iSueldo      = findIdx(headers, ALIAS.sueldo);
  const iIngreso     = findIdx(headers, ALIAS.ingreso);

  const empleados: EmpleadoCSV[] = [];
  const errores: string[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    const cols = split(raw);
    if (cols.length < 2) continue;

    const rut = iRut >= 0 ? cols[iRut] : '';
    if (!rut) { errores.push(`Fila ${i + 1}: sin RUT`); continue; }

    // Nombre: nombre completo > nombres + apellidos
    let nombre = '';
    if (iNombreComp >= 0 && cols[iNombreComp]) {
      nombre = cols[iNombreComp];
    } else {
      const n = iNombres >= 0 ? cols[iNombres] : '';
      const ap = iApellidoPat >= 0 ? cols[iApellidoPat] : '';
      const am = iApellidoMat >= 0 ? cols[iApellidoMat] : '';
      nombre = [n, ap, am].filter(Boolean).join(' ').trim();
    }
    if (!nombre) { errores.push(`Fila ${i + 1}: sin nombre`); continue; }

    empleados.push({
      rut,
      nombre,
      cargo:        iCargo >= 0 ? cols[iCargo] ?? '' : '',
      contrato:     iContrato >= 0 ? normalizeContrato(cols[iContrato] ?? '') : 'indefinido',
      banco:        iBanco >= 0 ? cols[iBanco] ?? '' : '',
      numeroCuenta: iCuenta >= 0 ? cols[iCuenta] ?? '' : '',
      sueldoBase:   iSueldo >= 0 ? parseSueldo(cols[iSueldo] ?? '0') : 0,
      fechaIngreso: iIngreso >= 0 ? parseFecha(cols[iIngreso] ?? '') : new Date().toISOString().slice(0, 10),
      _fila: i + 1,
    });
  }

  return { empleados, errores };
}
