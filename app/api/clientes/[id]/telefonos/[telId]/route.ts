import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  tipo: z.string().optional(),
  telefono: z.string().optional(),
  observacion: z.string().optional(),
  esPreferido: z.boolean().optional(),
  noDeseaPromociones: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; telId: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: clienteId, telId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const d = parsed.data;
  const pool = await getPool();

  if (d.esPreferido) {
    await pool.request()
      .input('id', sql.NVarChar(36), telId)
      .input('clienteId', sql.NVarChar(36), clienteId)
      .execute('sp_telefonos_setPreferido');
  }

  await pool.request()
    .input('id', sql.NVarChar(36), telId)
    .input('tipo', sql.NVarChar(50), d.tipo ?? null)
    .input('telefono', sql.NVarChar(30), d.telefono ?? null)
    .input('observacion', sql.NVarChar(300), d.observacion ?? null)
    .input('noDeseaPromociones', sql.Bit, d.noDeseaPromociones ?? null)
    .execute('sp_telefonos_update');

  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ telId: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { telId } = await params;
  const pool = await getPool();
  await pool.request()
    .input('id', sql.NVarChar(36), telId)
    .execute('sp_telefonos_delete');

  return Response.json({ ok: true });
}
