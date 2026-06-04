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
      .query(`SELECT * FROM dbo.MovimientoBancario WHERE empresaId=@empresaId ORDER BY fecha DESC`);
    return Response.json(result.recordset.map(row => ({
      id: row.id,
      cuentaId: row.cuentaId,
      fecha: row.fecha,
      descripcion: row.descripcion,
      monto: Number(row.monto),
      tipo: row.tipo,
    })));
  } catch (e) {
    console.error('[bancos/movimientos GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
