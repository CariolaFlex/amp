import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { CuentaBancaria } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): CuentaBancaria {
  return {
    id: row.id as string,
    banco: row.banco as string,
    numero: row.numero as string,
    tipo: row.tipo as string,
    saldo: Number(row.saldo),
    ultimaConciliacion: row.ultimaConciliacion ? row.ultimaConciliacion as Date : undefined,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_bancos_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[bancos GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const id = randomUUID();
    await getPool().then(pool =>
      pool.request()
        .input('id', sql.NVarChar(36), id)
        .input('empresaId', sql.NVarChar(36), session.user.empresaId)
        .input('banco', sql.NVarChar(100), body.banco)
        .input('numero', sql.NVarChar(50), body.numero || '')
        .input('tipo', sql.NVarChar(50), body.tipo || 'Cuenta Corriente')
        .input('saldo', sql.BigInt, Number(body.saldo) || 0)
        .execute('sp_bancos_create')
    );
    return Response.json({ id }, { status: 201 });
  } catch (e) {
    console.error('[bancos POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
