import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { OrdenVenta, TipoDte, EstadoOV } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id: cotizacionId } = await params;
    const empresaId = session.user.empresaId;
    const pool = await getPool();

    const countRes = await pool.request()
      .input('empresaId', sql.NVarChar(36), empresaId)
      .query<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM dbo.OrdenVenta WHERE empresaId=@empresaId');
    const n = countRes.recordset[0].cnt + 1;
    const ovNumero = `OV-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`;
    const ovId = randomUUID();

    const result = await pool.request()
      .input('cotizacionId', sql.NVarChar(36), cotizacionId)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .input('ovId', sql.NVarChar(36), ovId)
      .input('ovNumero', sql.NVarChar(50), ovNumero)
      .input('fechaEmision', sql.DateTime2, new Date())
      .execute('sp_cotizaciones_convertirAOV');

    const row = result.recordset[0];
    const ov: OrdenVenta = {
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

    return Response.json(ov, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('no existe o no esta aprobada')) {
      return Response.json({ error: 'La cotización no existe o no está aprobada' }, { status: 422 });
    }
    console.error('[cotizacion convertir POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
