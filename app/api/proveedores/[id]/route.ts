import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import type { Proveedor } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_proveedores_getById');
    const row = result.recordset[0];
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    const proveedor: Proveedor = {
      id: row.id as string,
      rut: row.rut as string,
      razonSocial: row.razonSocial as string,
      giro: (row.giro as string) ?? undefined,
      direccion: (row.direccion as string) ?? undefined,
      comuna: (row.comuna as string) ?? undefined,
      region: (row.region as string) ?? undefined,
      contactoNombre: (row.contactoNombre as string) ?? undefined,
      contactoEmail: (row.contactoEmail as string) ?? undefined,
      contactoTelefono: (row.contactoTelefono as string) ?? undefined,
      condicionPago: (row.condicionPago as string) ?? undefined,
      activo: row.activo as boolean,
      fechaAlta: new Date(row.fechaAlta as string),
    };
    return Response.json(proveedor);
  } catch (e) {
    console.error('[proveedor GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('razonSocial', sql.NVarChar(200), body.razonSocial ?? null)
      .input('giro', sql.NVarChar(200), body.giro ?? null)
      .input('contactoNombre', sql.NVarChar(200), body.contactoNombre ?? null)
      .input('contactoEmail', sql.NVarChar(255), body.contactoEmail ?? null)
      .input('contactoTelefono', sql.NVarChar(30), body.contactoTelefono ?? null)
      .input('condicionPago', sql.NVarChar(100), body.condicionPago ?? null)
      .input('activo', sql.Bit, body.activo ?? null)
      .execute('sp_proveedores_update');
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[proveedor PUT]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
