import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_cxc_list');
    return Response.json(result.recordset);
  } catch (e) {
    console.error('[cxc GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
