import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';

export const dynamic = 'force-dynamic';

export interface NotificacionRow {
  id: string;
  empresaId: string;
  usuarioId: string | null;
  tipo: string;
  mensaje: string;
  leida: boolean;
  creadoEn: string;
}

/** GET /api/notificaciones — últimas 20 (leídas y no leídas) del usuario/empresa */
export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('usuarioId', sql.NVarChar(36), session.user.id ?? null)
      .execute('sp_notificaciones_list');
    return Response.json(result.recordset);
  } catch (e) {
    console.error('[notificaciones GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

/** PUT /api/notificaciones — marcar todas como leídas */
export async function PUT() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('usuarioId', sql.NVarChar(36), session.user.id ?? null)
      .execute('sp_notificaciones_leer_todo');
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[notificaciones PUT leer_todo]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
