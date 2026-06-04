import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const pool = await getPool();
  const result = await pool.request()
    .input('empresaId', sql.NVarChar(36), session.user.empresaId)
    .execute('sp_leads_list');

  return Response.json(result.recordset);
}

const schema = z.object({
  nombre: z.string().min(1),
  empresa: z.string().optional(),
  rut: z.string().optional(),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  fuente: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const d = parsed.data;
  const id = randomUUID();
  const pool = await getPool();

  await pool.request()
    .input('id', sql.NVarChar(36), id)
    .input('empresaId', sql.NVarChar(36), session.user.empresaId)
    .input('nombre', sql.NVarChar(200), d.nombre)
    .input('empresa', sql.NVarChar(200), d.empresa ?? null)
    .input('rut', sql.NVarChar(20), d.rut ?? null)
    .input('email', sql.NVarChar(255), d.email ?? null)
    .input('telefono', sql.NVarChar(30), d.telefono ?? null)
    .input('fuente', sql.NVarChar(100), d.fuente ?? null)
    .input('createdAt', sql.DateTime2, new Date())
    .execute('sp_leads_create');

  return Response.json({ id }, { status: 201 });
}
