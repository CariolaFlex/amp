import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { AsientoContable } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): AsientoContable {
  return {
    id: row.id as string,
    fecha: row.fecha as Date,
    numero: row.numero as number,
    glosa: row.glosa as string,
    debe: Number(row.debe),
    haber: Number(row.haber),
    cuentaCodigo: row.cuentaCodigo as string,
    cuentaNombre: row.cuentaNombre as string,
    periodo: row.periodo as string,
  };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const periodo = searchParams.get('periodo');
  try {
    const pool = await getPool();
    const r = pool.request().input('empresaId', sql.NVarChar(36), session.user.empresaId);
    if (periodo) r.input('periodo', sql.NVarChar(7), periodo);
    const result = await r.execute('sp_asientos_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[asientos GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json() as {
      fecha: string;
      glosa: string;
      lineas: { cuentaCodigo: string; cuentaNombre: string; debe: number; haber: number }[];
    };
    const { fecha, glosa, lineas } = body;
    if (!lineas?.length) return Response.json({ error: 'Sin líneas' }, { status: 400 });

    const totalDebe = lineas.reduce((s, l) => s + (Number(l.debe) || 0), 0);
    const totalHaber = lineas.reduce((s, l) => s + (Number(l.haber) || 0), 0);
    if (totalDebe !== totalHaber || totalDebe === 0) {
      return Response.json({ error: 'El asiento debe estar balanceado (Debe = Haber)' }, { status: 400 });
    }

    const empresaId = session.user.empresaId;
    const fechaDate = new Date(fecha);
    const periodo = `${fechaDate.getFullYear()}-${String(fechaDate.getMonth() + 1).padStart(2, '0')}`;
    const pool = await getPool();

    const numRes = await pool.request()
      .input('empresaId', sql.NVarChar(36), empresaId)
      .input('periodo', sql.NVarChar(7), periodo)
      .execute('sp_asientos_nextNumero');
    const numero = numRes.recordset[0].siguiente as number;

    const lineasValidas = lineas.filter(l => l.cuentaCodigo?.trim() && (l.debe > 0 || l.haber > 0));
    for (const linea of lineasValidas) {
      await pool.request()
        .input('id', sql.NVarChar(36), randomUUID())
        .input('empresaId', sql.NVarChar(36), empresaId)
        .input('fecha', sql.DateTime2, fechaDate)
        .input('numero', sql.Int, numero)
        .input('glosa', sql.NVarChar(500), glosa)
        .input('debe', sql.BigInt, Number(linea.debe) || 0)
        .input('haber', sql.BigInt, Number(linea.haber) || 0)
        .input('cuentaCodigo', sql.NVarChar(20), linea.cuentaCodigo.trim())
        .input('cuentaNombre', sql.NVarChar(200), linea.cuentaNombre?.trim() || '')
        .input('periodo', sql.NVarChar(7), periodo)
        .query(`INSERT INTO dbo.AsientoContable(id,empresaId,fecha,numero,glosa,debe,haber,cuentaCodigo,cuentaNombre,periodo)
                VALUES(@id,@empresaId,@fecha,@numero,@glosa,@debe,@haber,@cuentaCodigo,@cuentaNombre,@periodo)`);
    }

    return Response.json({ numero }, { status: 201 });
  } catch (e) {
    console.error('[asientos POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
