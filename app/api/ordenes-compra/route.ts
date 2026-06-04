import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { OrdenCompra, EstadoOC } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): OrdenCompra {
  return {
    id: row.id as string,
    numero: row.numero as string,
    proveedorRut: row.proveedorRut as string,
    proveedorNombre: row.proveedorNombre as string,
    estado: row.estado as EstadoOC,
    fechaEmision: new Date(row.fechaEmision as string),
    total: Number(row.total),
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_ordenescompra_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[ordenes-compra GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const empresaId = session.user.empresaId;
    const pool = await getPool();

    const countRes = await pool.request()
      .input('empresaId', sql.NVarChar(36), empresaId)
      .query<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM dbo.OrdenCompra WHERE empresaId=@empresaId');
    const n = countRes.recordset[0].cnt + 1;
    const numero = `OC-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`;
    const id = randomUUID();

    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .input('numero', sql.NVarChar(50), numero)
      .input('proveedorId', sql.NVarChar(36), body.proveedorId)
      .input('proveedorRut', sql.NVarChar(20), body.proveedorRut)
      .input('proveedorNombre', sql.NVarChar(200), body.proveedorNombre)
      .input('estado', sql.NVarChar(50), 'borrador')
      .input('fechaEmision', sql.DateTime2, new Date())
      .input('total', sql.BigInt, body.total ?? 0)
      .execute('sp_ordenescompra_create');

    return Response.json({ id, numero }, { status: 201 });
  } catch (e) {
    console.error('[ordenes-compra POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
