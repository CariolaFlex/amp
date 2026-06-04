import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .query('SELECT * FROM dbo.CuentaBancaria WHERE id=@id AND empresaId=@empresaId');
    if (!result.recordset[0]) return Response.json({ error: 'Not found' }, { status: 404 });
    const row = result.recordset[0];
    return Response.json({
      id: row.id, banco: row.banco, numero: row.numero, tipo: row.tipo,
      saldo: Number(row.saldo), ultimaConciliacion: row.ultimaConciliacion ?? undefined,
    });
  } catch (e) {
    console.error('[bancos/id GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
