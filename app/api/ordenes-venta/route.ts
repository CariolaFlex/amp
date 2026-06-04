import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import type { OrdenVenta, TipoDte, EstadoOV } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): OrdenVenta {
  return {
    id: row.id as string,
    numero: row.numero as string,
    cotizacionId: (row.cotizacionId as string) ?? undefined,
    clienteId: (row.clienteId as string) ?? undefined,
    clienteNombre: row.clienteNombre as string,
    clienteRut: row.clienteRut as string,
    tipoDte: (row.tipoDte as number) as TipoDte,
    fechaEmision: new Date(row.fechaEmision as string),
    lineas: [],
    neto: Number(row.neto),
    iva: Number(row.iva),
    total: Number(row.total),
    estado: row.estado as EstadoOV,
    dteId: (row.dteId as string) ?? undefined,
    vendedorNombre: (row.vendedorNombre as string) ?? undefined,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_ordenesventa_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[ordenes-venta GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
