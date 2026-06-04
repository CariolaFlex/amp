import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import type { OrdenVenta, TipoDte, EstadoOV, LineaDte } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const empresaId = session.user.empresaId;
    const pool = await getPool();

    const [headerRes, lineasRes] = await Promise.all([
      pool.request()
        .input('id', sql.NVarChar(36), id)
        .input('empresaId', sql.NVarChar(36), empresaId)
        .execute('sp_ordenesventa_getById'),
      pool.request()
        .input('documentoId', sql.NVarChar(36), id)
        .query<Record<string, unknown>>(
          `SELECT * FROM dbo.LineaDocumento WHERE documentoId=@documentoId AND documentoTipo='orden_venta'`
        ),
    ]);

    const row = headerRes.recordset[0];
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    const ov: OrdenVenta = {
      id: row.id as string,
      numero: row.numero as string,
      cotizacionId: (row.cotizacionId as string) ?? undefined,
      clienteId: (row.clienteId as string) ?? undefined,
      clienteNombre: row.clienteNombre as string,
      clienteRut: row.clienteRut as string,
      tipoDte: (row.tipoDte as number) as TipoDte,
      fechaEmision: new Date(row.fechaEmision as string),
      lineas: lineasRes.recordset.map((l) => ({
        id: l.id as string,
        descripcion: l.descripcion as string,
        cantidad: l.cantidad as number,
        precioUnitario: Number(l.precioUnitario),
        descuento: l.descuento as number,
        total: Number(l.total),
        productoId: (l.productoId as string) ?? undefined,
      } as LineaDte)),
      neto: Number(row.neto),
      iva: Number(row.iva),
      total: Number(row.total),
      estado: row.estado as EstadoOV,
      dteId: (row.dteId as string) ?? undefined,
      vendedorNombre: (row.vendedorNombre as string) ?? undefined,
    };

    return Response.json(ov);
  } catch (e) {
    console.error('[orden-venta GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
