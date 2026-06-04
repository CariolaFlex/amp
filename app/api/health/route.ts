import { getPool, query } from '@/lib/db/mssql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await query<{ version: string }>('SELECT @@VERSION AS version');
    const version = rows[0]?.version?.split('\n')[0] ?? 'unknown';
    return Response.json({ ok: true, db: 'connected', version });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, db: 'disconnected', error: message }, { status: 503 });
  }
}
