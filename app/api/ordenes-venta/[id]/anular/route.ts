import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id: ovId } = await params;
    const empresaId = session.user.empresaId;
    const pool = await getPool();

    await pool.request()
      .input('ovId', sql.NVarChar(36), ovId)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .execute('sp_ordenesventa_anular');

    return Response.json({ ok: true });
  } catch (e) {
    console.error('[ov anular POST]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
