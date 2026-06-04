import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { parsearCartola } from '@/lib/utils/csv-bancos';
import type { LineaCartola } from '@/lib/utils/csv-bancos';
import type { MovimientoBancario } from '@/types';

export const dynamic = 'force-dynamic';

interface MovDB extends MovimientoBancario { _matched?: boolean }

function mapRow(row: Record<string, unknown>): MovDB {
  return {
    id: row.id as string,
    cuentaId: row.cuentaId as string,
    fecha: new Date(row.fecha as string),
    descripcion: row.descripcion as string,
    monto: Number(row.monto),
    tipo: row.tipo as 'abono' | 'cargo',
  };
}

function fechaCercana(a: Date, b: Date, diasTol = 3): boolean {
  return Math.abs(a.getTime() - b.getTime()) <= diasTol * 86_400_000;
}

export interface ResultadoConciliacion {
  /** Líneas de cartola que tienen match en la DB */
  conciliados: Array<{ cartola: LineaCartola; movimiento: MovimientoBancario }>;
  /** Líneas de cartola sin match → candidatos a importar */
  soloEnCartola: LineaCartola[];
  /** Movimientos DB sin match en la cartola */
  soloEnDB: MovimientoBancario[];
  totalLineas: number;
}

/**
 * POST /api/bancos/[id]/conciliar
 * Body: multipart/form-data  { file: CSV, banco?: string }
 * Devuelve ResultadoConciliacion
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: cuentaId } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return Response.json({ error: 'Se requiere un archivo CSV' }, { status: 400 });
    }
    const csvText = await file.text();

    // Parsear cartola
    const lineas = parsearCartola(csvText);
    if (lineas.length === 0) {
      return Response.json({ error: 'No se encontraron líneas válidas en el CSV' }, { status: 422 });
    }

    // Cargar movimientos existentes de la cuenta
    const pool = await getPool();
    const dbRes = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('cuentaId', sql.NVarChar(36), cuentaId)
      .execute('sp_movBancarios_list');
    const movimientos: MovDB[] = dbRes.recordset.map(mapRow);

    // Matching: monto exacto (abs) + tipo + fecha ±3 días + no usado
    const usedDB = new Set<string>();
    const usedCartola = new Set<number>();

    const conciliados: ResultadoConciliacion['conciliados'] = [];

    lineas.forEach((linea, idx) => {
      const match = movimientos.find(
        (m) =>
          !usedDB.has(m.id) &&
          m.tipo === linea.tipo &&
          Math.abs(m.monto) === Math.abs(linea.monto) &&
          fechaCercana(linea.fecha, m.fecha),
      );
      if (match) {
        usedDB.add(match.id);
        usedCartola.add(idx);
        conciliados.push({ cartola: linea, movimiento: match });
      }
    });

    const soloEnCartola = lineas.filter((_, idx) => !usedCartola.has(idx));
    const soloEnDB = movimientos.filter((m) => !usedDB.has(m.id));

    const result: ResultadoConciliacion = {
      conciliados,
      soloEnCartola,
      soloEnDB,
      totalLineas: lineas.length,
    };

    return Response.json(result);
  } catch (e) {
    console.error('[bancos/id/conciliar POST]', e);
    return Response.json({ error: 'Error al procesar el archivo' }, { status: 500 });
  }
}
