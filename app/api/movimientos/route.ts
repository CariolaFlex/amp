import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { MovimientoStock } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): MovimientoStock {
  return {
    id: row.id as string,
    productoId: row.productoId as string,
    productoNombre: row.productoNombre as string,
    tipo: row.tipo as MovimientoStock['tipo'],
    cantidad: row.cantidad as number,
    motivo: (row.motivo as string) ?? undefined,
    fecha: new Date(row.fecha as string),
    usuario: row.usuario as string,
  };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const productoId = searchParams.get('productoId');
    const empresaId = session.user.empresaId;
    const pool = await getPool();

    let result;
    if (productoId) {
      result = await pool.request()
        .input('productoId', sql.NVarChar(36), productoId)
        .input('empresaId', sql.NVarChar(36), empresaId)
        .execute('sp_movimientos_listByProducto');
    } else {
      result = await pool.request()
        .input('empresaId', sql.NVarChar(36), empresaId)
        .execute('sp_movimientos_list');
    }
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[movimientos GET]', e);
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

    const magnitud = Math.abs(Number(body.cantidad));
    const tipo: MovimientoStock['tipo'] = body.tipo;
    const delta = tipo === 'entrada' ? magnitud : tipo === 'salida' ? -magnitud : Number(body.cantidad);

    await pool.request()
      .input('id', sql.NVarChar(36), body.productoId)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .input('delta', sql.Int, delta)
      .input('tipo', sql.NVarChar(50), tipo)
      .input('motivo', sql.NVarChar(300), body.motivo ?? null)
      .input('usuario', sql.NVarChar(200), body.usuario ?? 'Sistema')
      .input('movimientoId', sql.NVarChar(36), randomUUID())
      .execute('sp_productos_ajustarStock');

    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error('[movimientos POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
