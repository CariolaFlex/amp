import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { Producto, EstadoStock } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): Producto {
  return {
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
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_productos_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[productos GET]', e);
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
    const stockInicial = Number(body.stockDisponible) || 0;

    await getPool().then((pool) =>
      pool.request()
        .input('id', sql.NVarChar(36), id)
        .input('empresaId', sql.NVarChar(36), empresaId)
        .input('sku', sql.NVarChar(50), body.sku)
        .input('nombre', sql.NVarChar(200), body.nombre)
        .input('categoria', sql.NVarChar(100), body.categoria ?? 'Sin categoría')
        .input('precioVenta', sql.BigInt, body.precioVenta ?? 0)
        .input('costoPMP', sql.BigInt, body.costoPMP ?? 0)
        .input('stockDisponible', sql.Int, stockInicial)
        .input('stockReservado', sql.Int, 0)
        .input('stockMinimo', sql.Int, body.stockMinimo ?? 0)
        .input('unidad', sql.NVarChar(20), body.unidad ?? 'un')
        .execute('sp_productos_create')
    );

    // Registrar movimiento de stock inicial si > 0
    if (stockInicial > 0) {
      const pool = await getPool();
      await pool.request()
        .input('id', sql.NVarChar(36), randomUUID())
        .input('empresaId', sql.NVarChar(36), empresaId)
        .input('productoId', sql.NVarChar(36), id)
        .input('delta', sql.Int, stockInicial)
        .input('tipo', sql.NVarChar(50), 'entrada')
        .input('motivo', sql.NVarChar(300), 'Stock inicial')
        .input('usuario', sql.NVarChar(200), 'Sistema')
        .input('movimientoId', sql.NVarChar(36), randomUUID())
        .execute('sp_productos_ajustarStock');
    }

    return Response.json({ id }, { status: 201 });
  } catch (e) {
    console.error('[productos POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
