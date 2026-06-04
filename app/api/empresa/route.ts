import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';

export const dynamic = 'force-dynamic';

/** GET /api/empresa — datos de la empresa de la sesión activa */
export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const res = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_empresa_getBySession');
    if (!res.recordset[0]) return Response.json({ error: 'Empresa no encontrada' }, { status: 404 });
    return Response.json(res.recordset[0]);
  } catch (e) {
    console.error('[empresa GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

/** PUT /api/empresa — actualiza datos tributarios (paso 1 onboarding) */
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), session.user.empresaId)
      .input('rut', sql.NVarChar(20), body.rut ?? '')
      .input('razonSocial', sql.NVarChar(200), body.razonSocial ?? '')
      .input('giro', sql.NVarChar(200), body.giro ?? '')
      .input('direccion', sql.NVarChar(300), body.direccion ?? '')
      .input('comuna', sql.NVarChar(100), body.comuna ?? '')
      .input('ciudad', sql.NVarChar(100), body.ciudad ?? '')
      .input('actividadEconomica', sql.NVarChar(200), body.actividadEconomica ?? null)
      .execute('sp_empresa_actualizar');
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[empresa PUT]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

/** PATCH /api/empresa — actualiza campo SII puntual (pfxPath, ambiente, onboardingCompleto) */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { campo, valor } = await req.json() as { campo: string; valor: string };
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), session.user.empresaId)
      .input('campo', sql.NVarChar(50), campo)
      .input('valor', sql.NVarChar(500), valor ?? '')
      .execute('sp_empresa_setSii');
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[empresa PATCH]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
