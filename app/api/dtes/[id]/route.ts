import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import type { Dte, TipoDte, EstadoDte, LineaDte } from '@/types';

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
        .execute('sp_dtes_getById'),
      pool.request()
        .input('documentoId', sql.NVarChar(36), id)
        .query<Record<string, unknown>>(
          `SELECT * FROM dbo.LineaDocumento WHERE documentoId=@documentoId AND documentoTipo='dte'`
        ),
    ]);

    const row = headerRes.recordset[0];
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    const dte: Dte = {
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
      lineas: lineasRes.recordset.map((l) => ({
        id: l.id as string,
        descripcion: l.descripcion as string,
        cantidad: l.cantidad as number,
        precioUnitario: Number(l.precioUnitario),
        descuento: l.descuento as number,
        total: Number(l.total),
        productoId: (l.productoId as string) ?? undefined,
      } as LineaDte)),
      vendedorId: (row.vendedorId as string) ?? undefined,
      ordenVentaId: (row.ordenVentaId as string) ?? undefined,
    };

    return Response.json(dte);
  } catch (e) {
    console.error('[dte GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const empresaId = session.user.empresaId;
    const pool = await getPool();

    const spName = body.action === 'pagar' ? 'sp_dtes_marcarPagado' : 'sp_dtes_anular';
    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .execute(spName);

    return Response.json({ ok: true });
  } catch (e) {
    console.error('[dte PUT]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
