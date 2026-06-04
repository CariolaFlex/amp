import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { Cotizacion, TipoDte, EstadoCotizacion, LineaDte } from '@/types';

export const dynamic = 'force-dynamic';

function mapLinea(row: Record<string, unknown>): LineaDte {
  return {
    id: row.id as string,
    descripcion: row.descripcion as string,
    cantidad: row.cantidad as number,
    precioUnitario: Number(row.precioUnitario),
    descuento: row.descuento as number,
    total: Number(row.total),
    productoId: (row.productoId as string) ?? undefined,
  };
}

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
        .execute('sp_cotizaciones_getById'),
      pool.request()
        .input('documentoId', sql.NVarChar(36), id)
        .query<Record<string, unknown>>(
          `SELECT * FROM dbo.LineaDocumento WHERE documentoId=@documentoId AND documentoTipo='cotizacion'`
        ),
    ]);

    const row = headerRes.recordset[0];
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    const cotizacion: Cotizacion = {
      id: row.id as string,
      numero: row.numero as string,
      clienteId: (row.clienteId as string) ?? undefined,
      clienteNombre: row.clienteNombre as string,
      clienteRut: row.clienteRut as string,
      tipoDte: (row.tipoDte as number) as TipoDte,
      fechaEmision: new Date(row.fechaEmision as string),
      condicionPago: (row.condicionPago as string) ?? undefined,
      lineas: lineasRes.recordset.map(mapLinea),
      neto: Number(row.neto),
      iva: Number(row.iva),
      total: Number(row.total),
      notas: (row.notas as string) ?? undefined,
      estado: row.estado as EstadoCotizacion,
      vendedorId: (row.vendedorId as string) ?? undefined,
      vendedorNombre: (row.vendedorNombre as string) ?? undefined,
      ordenVentaId: (row.ordenVentaId as string) ?? undefined,
    };

    return Response.json(cotizacion);
  } catch (e) {
    console.error('[cotizacion GET]', e);
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

    // Preserve ordenVentaId (SP always overwrites it)
    const existingRes = await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .execute('sp_cotizaciones_getById');
    const existing = existingRes.recordset[0];
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .input('clienteId', sql.NVarChar(36), body.clienteId ?? null)
      .input('clienteNombre', sql.NVarChar(200), body.clienteNombre ?? null)
      .input('clienteRut', sql.NVarChar(20), body.clienteRut ?? null)
      .input('tipoDte', sql.Int, body.tipoDte ?? null)
      .input('condicionPago', sql.NVarChar(100), body.condicionPago ?? null)
      .input('neto', sql.BigInt, body.neto ?? null)
      .input('iva', sql.BigInt, body.iva ?? null)
      .input('total', sql.BigInt, body.total ?? null)
      .input('notas', sql.NVarChar(sql.MAX), body.notas ?? null)
      .input('estado', sql.NVarChar(50), body.estado ?? null)
      .input('ordenVentaId', sql.NVarChar(36), (existing.ordenVentaId as string) ?? null)
      .execute('sp_cotizaciones_update');

    if (body.lineas !== undefined) {
      await pool.request()
        .input('documentoId', sql.NVarChar(36), id)
        .query(`DELETE FROM dbo.LineaDocumento WHERE documentoId=@documentoId AND documentoTipo='cotizacion'`);

      for (const linea of body.lineas) {
        await pool.request()
          .input('id', sql.NVarChar(36), linea.id ?? randomUUID())
          .input('documentoTipo', sql.NVarChar(50), 'cotizacion')
          .input('documentoId', sql.NVarChar(36), id)
          .input('empresaId', sql.NVarChar(36), empresaId)
          .input('descripcion', sql.NVarChar(500), linea.descripcion)
          .input('cantidad', sql.Int, linea.cantidad)
          .input('precioUnitario', sql.BigInt, linea.precioUnitario)
          .input('descuento', sql.Int, linea.descuento ?? 0)
          .input('total', sql.BigInt, linea.total)
          .input('productoId', sql.NVarChar(36), linea.productoId ?? null)
          .query(`INSERT INTO dbo.LineaDocumento(id,documentoTipo,documentoId,empresaId,descripcion,cantidad,precioUnitario,descuento,total,productoId)
                  VALUES(@id,@documentoTipo,@documentoId,@empresaId,@descripcion,@cantidad,@precioUnitario,@descuento,@total,@productoId)`);
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error('[cotizacion PUT]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
