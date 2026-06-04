import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { randomUUID } from 'crypto';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: clienteId } = await params;
  const pool = await getPool();
  const result = await pool.request()
    .input('clienteId', sql.NVarChar(36), clienteId)
    .execute('sp_emails_list');

  return Response.json(result.recordset);
}

const schema = z.object({
  tipo: z.string().default('Personal'),
  email: z.string().email(),
  esPreferido: z.boolean().default(false),
  publicidad: z.boolean().default(true),
  observacion: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: clienteId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const d = parsed.data;
  const id = randomUUID();
  const pool = await getPool();

  await pool.request()
    .input('id', sql.NVarChar(36), id)
    .input('clienteId', sql.NVarChar(36), clienteId)
    .input('tipo', sql.NVarChar(50), d.tipo)
    .input('email', sql.NVarChar(255), d.email)
    .input('esPreferido', sql.Bit, d.esPreferido)
    .input('publicidad', sql.Bit, d.publicidad)
    .input('observacion', sql.NVarChar(300), d.observacion ?? null)
    .input('fechaAlta', sql.DateTime2, new Date())
    .input('ultimoContacto', sql.DateTime2, null)
    .execute('sp_emails_create');

  return Response.json({ id, clienteId, ...d, fechaAlta: new Date() }, { status: 201 });
}
