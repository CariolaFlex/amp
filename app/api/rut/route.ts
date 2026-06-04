import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';

export const dynamic = 'force-dynamic';

export interface ServelResult {
  rut: string;
  nombre: string;
  tipo: 'persona' | 'empresa';
}

/**
 * GET /api/rut?q=12345678   → búsqueda por RUT (dígitos)
 * GET /api/rut?q=pedro      → búsqueda por nombre (prefijo)
 * Devuelve máx. 10 resultados de ServelContribuyentes.
 * Retorna [] vacío (no error) si la tabla aún no existe (antes del import de Carlos).
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return Response.json([]);

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('q', sql.NVarChar(100), q)
      .execute('sp_servel_buscar');
    return Response.json(result.recordset as ServelResult[]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    // Si la tabla o SP aún no existe → retornar vacío (no romper la UI)
    if (msg.includes('sp_servel_buscar') || msg.includes('ServelContribuyentes')) {
      return Response.json([]);
    }
    console.error('[rut GET]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
