import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { insertarNotificacion } from '@/lib/db/notificaciones';
import { randomUUID } from 'crypto';
import type { Dte, TipoDte, EstadoDte } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id: ovId } = await params;
    const empresaId = session.user.empresaId;
    const pool = await getPool();

    const ovRes = await pool.request()
      .input('id', sql.NVarChar(36), ovId)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .execute('sp_ordenesventa_getById');
    const ov = ovRes.recordset[0];
    if (!ov) return Response.json({ error: 'OV no encontrada' }, { status: 404 });

    const folioRes = await pool.request()
      .input('empresaId', sql.NVarChar(36), empresaId)
      .input('tipo', sql.Int, ov.tipoDte as number)
      .execute('sp_folios_siguiente');
    const folio = folioRes.recordset[0].folio as number;

    const dteId = randomUUID();
    const cxcId = randomUUID();
    const fechaEmision = new Date();
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    const result = await pool.request()
      .input('ovId', sql.NVarChar(36), ovId)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .input('dteId', sql.NVarChar(36), dteId)
      .input('folio', sql.Int, folio)
      .input('fechaEmision', sql.DateTime2, fechaEmision)
      .input('fechaVencimiento', sql.DateTime2, fechaVencimiento)
      .input('cxcId', sql.NVarChar(36), cxcId)
      .execute('sp_ordenesventa_emitirDte');

    const row = result.recordset[0];
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
      lineas: [],
      vendedorId: (row.vendedorId as string) ?? undefined,
      ordenVentaId: (row.ordenVentaId as string) ?? undefined,
    };

    void insertarNotificacion({
      empresaId,
      tipo: 'dte_emitido',
      mensaje: `DTE folio #${folio} emitido a ${ov.clienteNombre ?? 'cliente'}.`,
    });

    return Response.json(dte, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('no existe o no esta pendiente')) {
      return Response.json({ error: 'La OV no existe o no está pendiente' }, { status: 422 });
    }
    console.error('[ov emitir POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
