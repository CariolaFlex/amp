import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { Cotizacion, TipoDte, EstadoCotizacion } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): Cotizacion {
  return {
    id: row.id as string,
    numero: row.numero as string,
    clienteId: (row.clienteId as string) ?? undefined,
    clienteNombre: row.clienteNombre as string,
    clienteRut: row.clienteRut as string,
    tipoDte: (row.tipoDte as number) as TipoDte,
    fechaEmision: new Date(row.fechaEmision as string),
    condicionPago: (row.condicionPago as string) ?? undefined,
    lineas: [],
    neto: Number(row.neto),
    iva: Number(row.iva),
    total: Number(row.total),
    notas: (row.notas as string) ?? undefined,
    estado: row.estado as EstadoCotizacion,
    vendedorId: (row.vendedorId as string) ?? undefined,
    vendedorNombre: (row.vendedorNombre as string) ?? undefined,
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
      .execute('sp_cotizaciones_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[cotizaciones GET]', e);
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

    const countRes = await pool.request()
      .input('empresaId', sql.NVarChar(36), empresaId)
      .query<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM dbo.Cotizacion WHERE empresaId=@empresaId');
    const n = countRes.recordset[0].cnt + 1;
    const numero = `COT-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`;
    const id = randomUUID();

    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .input('numero', sql.NVarChar(50), numero)
      .input('clienteId', sql.NVarChar(36), body.clienteId ?? null)
      .input('clienteNombre', sql.NVarChar(200), body.clienteNombre)
      .input('clienteRut', sql.NVarChar(20), body.clienteRut)
      .input('tipoDte', sql.Int, body.tipoDte)
      .input('fechaEmision', sql.DateTime2, new Date())
      .input('condicionPago', sql.NVarChar(100), body.condicionPago ?? null)
      .input('neto', sql.BigInt, body.neto)
      .input('iva', sql.BigInt, body.iva)
      .input('total', sql.BigInt, body.total)
      .input('notas', sql.NVarChar(sql.MAX), body.notas ?? null)
      .input('estado', sql.NVarChar(50), body.estado ?? 'borrador')
      .input('vendedorId', sql.NVarChar(36), body.vendedorId ?? null)
      .input('vendedorNombre', sql.NVarChar(200), body.vendedorNombre ?? null)
      .execute('sp_cotizaciones_create');

    for (const linea of (body.lineas ?? [])) {
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

    return Response.json({ id, numero }, { status: 201 });
  } catch (e) {
    console.error('[cotizaciones POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
