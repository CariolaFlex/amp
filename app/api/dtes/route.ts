import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import type { Dte, TipoDte, EstadoDte } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): Dte {
  return {
    id: row.id as string,
    folio: row.folio as number,
    tipo: (row.tipo as number) as TipoDte,
    estado: row.estado as EstadoDte,
    clienteRut: row.clienteRut as string,
    clienteNombre: row.clienteNombre as string,
    fechaEmision: new Date(row.fechaEmision as string),
    fechaVencimiento: row.fechaVencimiento ? new Date(row.fechaVencimiento as string) : undefined,
    neto: Number(row.neto),
    iva: Number(row.iva),
    total: Number(row.total),
    lineas: [],
    vendedorId: (row.vendedorId as string) ?? undefined,
    ordenVentaId: (row.ordenVentaId as string) ?? undefined,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_dtes_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[dtes GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
