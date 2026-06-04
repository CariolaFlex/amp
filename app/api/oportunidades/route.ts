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
    .execute('sp_oportunidades_list');

  return Response.json(result.recordset);
}

const schema = z.object({
  titulo: z.string().min(1),
  clienteNombre: z.string().default(''),
  clienteRut: z.string().default(''),
  monto: z.number().default(0),
  etapa: z.string().default('prospeccion'),
  probabilidad: z.number().default(20),
  vendedorId: z.string().optional(),
  vendedorNombre: z.string().optional(),
  notas: z.string().optional(),
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
    .input('titulo', sql.NVarChar(200), d.titulo)
    .input('clienteNombre', sql.NVarChar(200), d.clienteNombre)
    .input('clienteRut', sql.NVarChar(20), d.clienteRut)
    .input('monto', sql.BigInt, d.monto)
    .input('etapa', sql.NVarChar(50), d.etapa)
    .input('probabilidad', sql.Int, d.probabilidad)
    .input('vendedorId', sql.NVarChar(36), d.vendedorId ?? null)
    .input('vendedorNombre', sql.NVarChar(200), d.vendedorNombre ?? null)
    .input('ultimaActividad', sql.DateTime2, new Date())
    .input('createdAt', sql.DateTime2, new Date())
    .input('notas', sql.NVarChar(sql.MAX), d.notas ?? null)
    .execute('sp_oportunidades_create');

  return Response.json({ id }, { status: 201 });
}
