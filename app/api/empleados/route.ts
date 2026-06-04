import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { Empleado, TipoContrato } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): Empleado {
  return {
    id: row.id as string,
    rut: row.rut as string,
    nombre: row.nombre as string,
    cargo: row.cargo as string,
    contrato: row.contrato as TipoContrato,
    banco: row.banco as string,
    numeroCuenta: row.numeroCuenta as string,
    sueldoBase: Number(row.sueldoBase),
    fechaIngreso: row.fechaIngreso as Date,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_empleados_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[empleados GET]', e);
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
        .input('rut', sql.NVarChar(20), body.rut || '')
        .input('nombre', sql.NVarChar(200), body.nombre)
        .input('cargo', sql.NVarChar(100), body.cargo || '')
        .input('contrato', sql.NVarChar(50), body.contrato || 'indefinido')
        .input('banco', sql.NVarChar(100), body.banco || '')
        .input('numeroCuenta', sql.NVarChar(50), body.numeroCuenta || '')
        .input('sueldoBase', sql.BigInt, Number(body.sueldoBase) || 0)
        .input('fechaIngreso', sql.DateTime2, new Date(body.fechaIngreso || Date.now()))
        .execute('sp_empleados_create')
    );
    return Response.json({ id }, { status: 201 });
  } catch (e) {
    console.error('[empleados POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
