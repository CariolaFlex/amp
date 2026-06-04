import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import type { TipoContrato } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .query('SELECT * FROM dbo.Empleado WHERE id=@id AND empresaId=@empresaId');
    if (!result.recordset[0]) return Response.json({ error: 'Not found' }, { status: 404 });
    const row = result.recordset[0];
    return Response.json({
      id: row.id, rut: row.rut, nombre: row.nombre, cargo: row.cargo,
      contrato: row.contrato as TipoContrato, banco: row.banco,
      numeroCuenta: row.numeroCuenta, sueldoBase: Number(row.sueldoBase),
      fechaIngreso: row.fechaIngreso,
    });
  } catch (e) {
    console.error('[empleados/id GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    await getPool().then(pool =>
      pool.request()
        .input('id', sql.NVarChar(36), id)
        .input('empresaId', sql.NVarChar(36), session.user.empresaId)
        .input('cargo', sql.NVarChar(100), body.cargo ?? null)
        .input('sueldoBase', sql.BigInt, body.sueldoBase != null ? Number(body.sueldoBase) : null)
        .input('banco', sql.NVarChar(100), body.banco ?? null)
        .input('numeroCuenta', sql.NVarChar(50), body.numeroCuenta ?? null)
        .execute('sp_empleados_update')
    );
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[empleados/id PUT]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
