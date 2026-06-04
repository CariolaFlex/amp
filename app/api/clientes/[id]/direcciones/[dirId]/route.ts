import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  tipo: z.string().optional(),
  calle: z.string().optional(),
  numero: z.string().optional(),
  departamento: z.string().optional(),
  comuna: z.string().optional(),
  localidad: z.string().optional(),
  region: z.string().optional(),
  codigoPostal: z.string().optional(),
  referencia: z.string().optional(),
  esPreferida: z.boolean().optional(),
  noDeseaPromociones: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; dirId: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { dirId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const d = parsed.data;
  const pool = await getPool();

  if (d.esPreferida) {
    const { id: clienteId } = await params;
    await pool.request()
      .input('id', sql.NVarChar(36), dirId)
      .input('clienteId', sql.NVarChar(36), clienteId)
      .execute('sp_direcciones_setPreferida');
  }

  await pool.request()
    .input('id', sql.NVarChar(36), dirId)
    .input('tipo', sql.NVarChar(50), d.tipo ?? null)
    .input('calle', sql.NVarChar(200), d.calle ?? null)
    .input('numero', sql.NVarChar(20), d.numero ?? null)
    .input('departamento', sql.NVarChar(50), d.departamento ?? null)
    .input('comuna', sql.NVarChar(100), d.comuna ?? null)
    .input('localidad', sql.NVarChar(100), d.localidad ?? null)
    .input('region', sql.NVarChar(100), d.region ?? null)
    .input('codigoPostal', sql.NVarChar(20), d.codigoPostal ?? null)
    .input('referencia', sql.NVarChar(300), d.referencia ?? null)
    .input('noDeseaPromociones', sql.Bit, d.noDeseaPromociones ?? null)
    .execute('sp_direcciones_update');

  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ dirId: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { dirId } = await params;
  const pool = await getPool();
  await pool.request()
    .input('id', sql.NVarChar(36), dirId)
    .execute('sp_direcciones_delete');

  return Response.json({ ok: true });
}
