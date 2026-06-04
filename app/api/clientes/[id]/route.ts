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
    .execute('sp_clientes_getById');

  if (!result.recordset[0]) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(result.recordset[0]);
}

const updateSchema = z.object({
  tipo: z.enum(['persona_natural', 'empresa']).optional(),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  genero: z.string().optional(),
  estadoCivil: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  profesion: z.string().optional(),
  nivelEstudio: z.string().optional(),
  nacionalidad: z.string().optional(),
  nombreEmpresa: z.string().optional(),
  razonSocial: z.string().optional(),
  giro: z.string().optional(),
  rut: z.string().optional(),
  tipoCliente: z.string().optional(),
  canalPreferido: z.string().optional(),
  canalOrigen: z.string().optional(),
  interesesCompra: z.array(z.string()).optional(),
  noDeseaPromociones: z.boolean().optional(),
  satisfaccionCsat: z.number().optional(),
  emailPrincipal: z.string().optional(),
  telefonoPrincipal: z.string().optional(),
  contactoReferidoNombre: z.string().optional(),
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

  await pool.request()
    .input('id', sql.NVarChar(36), id)
    .input('empresaId', sql.NVarChar(36), session.user.empresaId)
    .input('tipo', sql.NVarChar(50), d.tipo ?? null)
    .input('nombres', sql.NVarChar(200), d.nombres ?? null)
    .input('apellidos', sql.NVarChar(200), d.apellidos ?? null)
    .input('genero', sql.NVarChar(20), d.genero ?? null)
    .input('estadoCivil', sql.NVarChar(50), d.estadoCivil ?? null)
    .input('fechaNacimiento', sql.NVarChar(20), d.fechaNacimiento ?? null)
    .input('profesion', sql.NVarChar(100), d.profesion ?? null)
    .input('nivelEstudio', sql.NVarChar(100), d.nivelEstudio ?? null)
    .input('nacionalidad', sql.NVarChar(100), d.nacionalidad ?? null)
    .input('nombreEmpresa', sql.NVarChar(200), d.nombreEmpresa ?? null)
    .input('razonSocial', sql.NVarChar(200), d.razonSocial ?? null)
    .input('giro', sql.NVarChar(200), d.giro ?? null)
    .input('rut', sql.NVarChar(20), d.rut ?? null)
    .input('tipoCliente', sql.NVarChar(50), d.tipoCliente ?? null)
    .input('canalPreferido', sql.NVarChar(100), d.canalPreferido ?? null)
    .input('canalOrigen', sql.NVarChar(100), d.canalOrigen ?? null)
    .input('interesesCompra', sql.NVarChar(sql.MAX), d.interesesCompra ? JSON.stringify(d.interesesCompra) : null)
    .input('noDeseaPromociones', sql.Bit, d.noDeseaPromociones ?? null)
    .input('satisfaccionCsat', sql.Int, d.satisfaccionCsat ?? null)
    .input('emailPrincipal', sql.NVarChar(255), d.emailPrincipal ?? null)
    .input('telefonoPrincipal', sql.NVarChar(30), d.telefonoPrincipal ?? null)
    .input('contactoReferidoNombre', sql.NVarChar(200), d.contactoReferidoNombre ?? null)
    .execute('sp_clientes_update');

  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const pool = await getPool();
  await pool.request()
    .input('id', sql.NVarChar(36), id)
    .input('empresaId', sql.NVarChar(36), session.user.empresaId)
    .execute('sp_clientes_delete');

  return Response.json({ ok: true });
}
