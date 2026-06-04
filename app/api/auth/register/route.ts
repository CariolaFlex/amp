import { getPool, sql } from '@/lib/db/mssql';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  empresaNombre: z.string().min(2),
  empresaRut: z.string().min(8),
  giro: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const { nombre, email, password, empresaNombre, empresaRut, giro } = parsed.data;

    const passwordHash = await bcrypt.hash(password, 12);
    const empresaId = randomUUID();
    const plataformaId = randomUUID();
    const centroId = randomUUID();
    const usuarioId = randomUUID();

    const pool = await getPool();

    await pool.request()
      .input('id', sql.NVarChar(36), empresaId)
      .input('rut', sql.NVarChar(20), empresaRut)
      .input('razonSocial', sql.NVarChar(200), empresaNombre)
      .input('giro', sql.NVarChar(200), giro ?? '')
      .input('direccion', sql.NVarChar(300), '')
      .input('comuna', sql.NVarChar(100), '')
      .input('ciudad', sql.NVarChar(100), '')
      .execute('sp_empresas_crear');

    await pool.request()
      .input('id', sql.NVarChar(36), plataformaId)
      .input('empresaId', sql.NVarChar(36), empresaId)
      .input('nombre', sql.NVarChar(200), empresaNombre)
      .input('rut', sql.NVarChar(20), empresaRut)
      .execute('sp_plataformas_crear');

    await pool.request()
      .input('id', sql.NVarChar(36), centroId)
      .input('plataformaId', sql.NVarChar(36), plataformaId)
      .input('codigo', sql.NVarChar(50), '001')
      .input('nombre', sql.NVarChar(200), 'Casa Matriz')
      .execute('sp_centroscosto_crear');

    await pool.request()
      .input('id', sql.NVarChar(36), usuarioId)
      .input('nombre', sql.NVarChar(200), nombre)
      .input('email', sql.NVarChar(255), email.toLowerCase())
      .input('passwordHash', sql.NVarChar(255), passwordHash)
      .input('rol', sql.NVarChar(50), 'owner')
      .input('empresaId', sql.NVarChar(36), empresaId)
      .execute('sp_usuarios_crear');

    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isDuplicate = msg.includes('UNIQUE') || msg.includes('duplicate');
    return Response.json(
      { error: isDuplicate ? 'Ya existe una cuenta con ese correo o RUT' : 'Error al crear la cuenta' },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}
