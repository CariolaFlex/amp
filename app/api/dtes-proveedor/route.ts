import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { DteProveedor } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): DteProveedor {
  return {
    id: row.id as string,
    folio: row.folio as number,
    proveedorRut: row.proveedorRut as string,
    proveedorNombre: row.proveedorNombre as string,
    fechaEmision: new Date(row.fechaEmision as string),
    fechaLimiteAcuse: new Date(row.fechaLimiteAcuse as string),
    total: Number(row.total),
    estado: row.estado as DteProveedor['estado'],
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_dtesProveedor_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[dtes-proveedor GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const empresaId = session.user.empresaId;
    const id = randomUUID();
    const cxpId = randomUUID();
    const emision = new Date();
    const limiteAcuse = new Date(emision);
    limiteAcuse.setDate(limiteAcuse.getDate() + 8);

    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .input('folio', sql.Int, body.folio)
      .input('proveedorId', sql.NVarChar(36), body.proveedorId)
      .input('proveedorRut', sql.NVarChar(20), body.proveedorRut)
      .input('proveedorNombre', sql.NVarChar(200), body.proveedorNombre)
      .input('ordenCompraId', sql.NVarChar(36), body.ordenCompraId ?? null)
      .input('fechaEmision', sql.DateTime2, emision)
      .input('fechaLimiteAcuse', sql.DateTime2, limiteAcuse)
      .input('total', sql.BigInt, body.total ?? 0)
      .input('cxpId', sql.NVarChar(36), cxpId)
      .execute('sp_dtesProveedor_create');

    return Response.json({ id }, { status: 201 });
  } catch (e) {
    console.error('[dtes-proveedor POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
