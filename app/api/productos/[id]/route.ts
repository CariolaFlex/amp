import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import type { Producto, EstadoStock } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_productos_getById');
    const row = result.recordset[0];
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    const producto: Producto = {
      id: row.id as string,
      sku: row.sku as string,
      nombre: row.nombre as string,
      categoria: row.categoria as string,
      precioVenta: Number(row.precioVenta),
      costoPMP: Number(row.costoPMP),
      stockDisponible: row.stockDisponible as number,
      stockReservado: row.stockReservado as number,
      stockMinimo: row.stockMinimo as number,
      unidad: row.unidad as string,
      estado: row.estado as EstadoStock,
    };
    return Response.json(producto);
  } catch (e) {
    console.error('[producto GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('nombre', sql.NVarChar(200), body.nombre ?? null)
      .input('categoria', sql.NVarChar(100), body.categoria ?? null)
      .input('precioVenta', sql.BigInt, body.precioVenta ?? null)
      .input('costoPMP', sql.BigInt, body.costoPMP ?? null)
      .input('stockMinimo', sql.Int, body.stockMinimo ?? null)
      .input('unidad', sql.NVarChar(20), body.unidad ?? null)
      .execute('sp_productos_update');
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[producto PUT]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
