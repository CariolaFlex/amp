import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import type { Proveedor } from '@/types';

export const dynamic = 'force-dynamic';

function mapRow(row: Record<string, unknown>): Proveedor {
  return {
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
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_proveedores_list');
    return Response.json(result.recordset.map(mapRow));
  } catch (e) {
    console.error('[proveedores GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const id = randomUUID();
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('rut', sql.NVarChar(20), body.rut ?? '')
      .input('razonSocial', sql.NVarChar(200), body.razonSocial)
      .input('giro', sql.NVarChar(200), body.giro ?? null)
      .input('direccion', sql.NVarChar(300), body.direccion ?? null)
      .input('comuna', sql.NVarChar(100), body.comuna ?? null)
      .input('region', sql.NVarChar(100), body.region ?? null)
      .input('contactoNombre', sql.NVarChar(200), body.contactoNombre ?? null)
      .input('contactoEmail', sql.NVarChar(255), body.contactoEmail ?? null)
      .input('contactoTelefono', sql.NVarChar(30), body.contactoTelefono ?? null)
      .input('condicionPago', sql.NVarChar(100), body.condicionPago ?? null)
      .input('fechaAlta', sql.DateTime2, new Date())
      .execute('sp_proveedores_create');
    return Response.json({ id }, { status: 201 });
  } catch (e) {
    console.error('[proveedores POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
