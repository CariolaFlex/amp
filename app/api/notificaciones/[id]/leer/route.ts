import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';

export const dynamic = 'force-dynamic';

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_notificaciones_leer');
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[notificaciones leer PUT]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
