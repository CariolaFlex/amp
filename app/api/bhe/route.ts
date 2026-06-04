import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { BHE } from '@/types';

export const dynamic = 'force-dynamic';

// Requires: C:\AMP\sql\11_fix_schema.sql (DROP FK + ALTER TABLE BHE empleadoId NULL)

function mapRow(row: Record<string, unknown>): BHE {
  return {
    id: row.id as string,
    rut: row.rut as string,
    nombre: row.nombre as string,
    periodo: row.periodo as string,
    montoBruto: Number(row.montoBruto),
    retencion: Number(row.retencion),
    montoLiquido: Number(row.montoLiquido),
    fecha: row.fecha as Date,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_bhe_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[bhe GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const bruto = Number(body.montoBruto) || 0;
    const retencion = Math.round(bruto * 0.1525);
    const liquido = bruto - retencion;
    const id = randomUUID();
    await getPool().then(pool =>
      pool.request()
        .input('id', sql.NVarChar(36), id)
        .input('empresaId', sql.NVarChar(36), session.user.empresaId)
        .input('rut', sql.NVarChar(20), body.rut || '')
        .input('nombre', sql.NVarChar(200), body.nombre)
        .input('periodo', sql.NVarChar(7), body.periodo)
        .input('montoBruto', sql.BigInt, bruto)
        .input('retencion', sql.BigInt, retencion)
        .input('montoLiquido', sql.BigInt, liquido)
        .input('fecha', sql.DateTime2, new Date())
        .query(`INSERT INTO dbo.BHE(id,empresaId,empleadoId,rut,nombre,periodo,montoBruto,retencion,montoLiquido,fecha)
                VALUES(@id,@empresaId,NULL,@rut,@nombre,@periodo,@montoBruto,@retencion,@montoLiquido,@fecha)`)
    );
    return Response.json({ id }, { status: 201 });
  } catch (e) {
    console.error('[bhe POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
