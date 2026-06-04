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
    .execute('sp_direcciones_list');

  return Response.json(result.recordset);
}

const schema = z.object({
  tipo: z.string().default('Particular'),
  calle: z.string().min(1),
  numero: z.string().default(''),
  departamento: z.string().optional(),
  comuna: z.string().min(1),
  localidad: z.string().optional(),
  region: z.string().min(1),
  codigoPostal: z.string().optional(),
  referencia: z.string().optional(),
  esPreferida: z.boolean().default(false),
  noDeseaPromociones: z.boolean().default(false),
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
    .input('calle', sql.NVarChar(200), d.calle)
    .input('numero', sql.NVarChar(20), d.numero)
    .input('departamento', sql.NVarChar(50), d.departamento ?? null)
    .input('comuna', sql.NVarChar(100), d.comuna)
    .input('localidad', sql.NVarChar(100), d.localidad ?? null)
    .input('region', sql.NVarChar(100), d.region)
    .input('codigoPostal', sql.NVarChar(20), d.codigoPostal ?? null)
    .input('referencia', sql.NVarChar(300), d.referencia ?? null)
    .input('esPreferida', sql.Bit, d.esPreferida)
    .input('noDeseaPromociones', sql.Bit, d.noDeseaPromociones)
    .input('fechaAlta', sql.DateTime2, new Date())
    .input('fechaEntrega', sql.DateTime2, null)
    .execute('sp_direcciones_create');

  return Response.json({ id, clienteId, ...d, fechaAlta: new Date() }, { status: 201 });
}
