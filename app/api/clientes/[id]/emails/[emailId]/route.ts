import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  tipo: z.string().optional(),
  email: z.string().email().optional(),
  esPreferido: z.boolean().optional(),
  publicidad: z.boolean().optional(),
  observacion: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; emailId: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: clienteId, emailId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const d = parsed.data;
  const pool = await getPool();

  if (d.esPreferido) {
    await pool.request()
      .input('id', sql.NVarChar(36), emailId)
      .input('clienteId', sql.NVarChar(36), clienteId)
      .execute('sp_emails_setPreferido');
  }

  await pool.request()
    .input('id', sql.NVarChar(36), emailId)
    .input('tipo', sql.NVarChar(50), d.tipo ?? null)
    .input('email', sql.NVarChar(255), d.email ?? null)
    .input('publicidad', sql.Bit, d.publicidad ?? null)
    .input('observacion', sql.NVarChar(300), d.observacion ?? null)
    .execute('sp_emails_update');

  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ emailId: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { emailId } = await params;
  const pool = await getPool();
  await pool.request()
    .input('id', sql.NVarChar(36), emailId)
    .execute('sp_emails_delete');

  return Response.json({ ok: true });
}
