import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.NVarChar(36), id)
    .input('empresaId', sql.NVarChar(36), session.user.empresaId)
    .execute('sp_oportunidades_getById');

  if (!result.recordset[0]) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(result.recordset[0]);
}

const updateSchema = z.object({
  etapa: z.string().optional(),
  probabilidad: z.number().optional(),
  titulo: z.string().optional(),
  monto: z.number().optional(),
  notas: z.string().optional(),
  vendedorId: z.string().optional(),
  vendedorNombre: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const d = parsed.data;
  const pool = await getPool();

  if (d.etapa) {
    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('etapa', sql.NVarChar(50), d.etapa)
      .input('probabilidad', sql.Int, d.probabilidad ?? null)
      .input('ultimaActividad', sql.DateTime2, new Date())
      .execute('sp_oportunidades_setEtapa');
  } else {
    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('titulo', sql.NVarChar(200), d.titulo ?? null)
      .input('monto', sql.BigInt, d.monto ?? null)
      .input('notas', sql.NVarChar(sql.MAX), d.notas ?? null)
      .input('vendedorId', sql.NVarChar(36), d.vendedorId ?? null)
      .input('vendedorNombre', sql.NVarChar(200), d.vendedorNombre ?? null)
      .input('ultimaActividad', sql.DateTime2, new Date())
      .execute('sp_oportunidades_update');
  }

  return Response.json({ ok: true });
}
