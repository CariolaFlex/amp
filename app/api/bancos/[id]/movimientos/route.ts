import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { MovimientoBancario } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): MovimientoBancario {
  return {
    id: row.id as string,
    cuentaId: row.cuentaId as string,
    fecha: row.fecha as Date,
    descripcion: row.descripcion as string,
    monto: Number(row.monto),
    tipo: row.tipo as 'abono' | 'cargo',
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('cuentaId', sql.NVarChar(36), id)
      .execute('sp_movBancarios_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[bancos/id/movimientos GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: cuentaId } = await params;
  try {
    const body = await req.json();
    const montoSigned = Number(body.monto);
    const tipo: 'abono' | 'cargo' = montoSigned >= 0 ? 'abono' : 'cargo';
    const movId = randomUUID();
    await getPool().then(pool =>
      pool.request()
        .input('id', sql.NVarChar(36), movId)
        .input('empresaId', sql.NVarChar(36), session.user.empresaId)
        .input('cuentaId', sql.NVarChar(36), cuentaId)
        .input('fecha', sql.DateTime2, new Date(body.fecha))
        .input('descripcion', sql.NVarChar(500), body.descripcion)
        .input('monto', sql.BigInt, montoSigned)
        .input('tipo', sql.NVarChar(50), tipo)
        .execute('sp_movBancarios_create')
    );
    return Response.json({ id: movId }, { status: 201 });
  } catch (e) {
    console.error('[bancos/id/movimientos POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
