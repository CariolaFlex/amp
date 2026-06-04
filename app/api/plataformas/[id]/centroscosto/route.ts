import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const pool = await getPool();
  const result = await pool.request()
    .input('plataformaId', sql.NVarChar(36), id)
    .execute('sp_centroscosto_list');

  return Response.json(result.recordset);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: plataformaId } = await params;
  const body = await req.json();
  const parsed = z.object({ codigo: z.string(), nombre: z.string().min(1) }).safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const centroId = randomUUID();
  const pool = await getPool();
  await pool.request()
    .input('id', sql.NVarChar(36), centroId)
    .input('plataformaId', sql.NVarChar(36), plataformaId)
    .input('codigo', sql.NVarChar(50), parsed.data.codigo)
    .input('nombre', sql.NVarChar(200), parsed.data.nombre)
    .execute('sp_centroscosto_crear');

  return Response.json({ id: centroId, plataformaId, ...parsed.data, activo: true });
}
