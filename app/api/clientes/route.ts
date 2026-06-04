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
    .execute('sp_clientes_list');

  return Response.json(result.recordset);
}

const createSchema = z.object({
  tipo: z.enum(['persona_natural', 'empresa']),
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
  idCliente: z.string().optional(),
  tipoCliente: z.string().optional(),
  canalOrigen: z.string().optional(),
  emailPrincipal: z.string().optional(),
  telefonoPrincipal: z.string().optional(),
  noDeseaPromociones: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Datos inválidos' }, { status: 400 });

  const d = parsed.data;
  const id = randomUUID();
  const pool = await getPool();

  await pool.request()
    .input('id', sql.NVarChar(36), id)
    .input('empresaId', sql.NVarChar(36), session.user.empresaId)
    .input('tipo', sql.NVarChar(50), d.tipo)
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
    .input('idCliente', sql.NVarChar(50), d.idCliente ?? null)
    .input('fechaAlta', sql.DateTime2, new Date())
    .input('tipoCliente', sql.NVarChar(50), d.tipoCliente ?? null)
    .input('recencia', sql.Int, null)
    .input('frecuencia', sql.Int, null)
    .input('montoTotal', sql.BigInt, null)
    .input('satisfaccionCsat', sql.Int, null)
    .input('canalPreferido', sql.NVarChar(100), null)
    .input('canalOrigen', sql.NVarChar(100), d.canalOrigen ?? null)
    .input('interesesCompra', sql.NVarChar(sql.MAX), null)
    .input('noDeseaPromociones', sql.Bit, d.noDeseaPromociones ?? false)
    .input('contactoReferidoNombre', sql.NVarChar(200), null)
    .input('emailPrincipal', sql.NVarChar(255), d.emailPrincipal ?? null)
    .input('telefonoPrincipal', sql.NVarChar(30), d.telefonoPrincipal ?? null)
    .execute('sp_clientes_create');

  return Response.json({ id }, { status: 201 });
}
