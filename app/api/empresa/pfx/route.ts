import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

/**
 * POST /api/empresa/pfx — sube el certificado PFX
 * Body: multipart/form-data  { file: .pfx, password: string }
 * Almacena el archivo en uploads/pfx/{empresaId}.pfx
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return Response.json({ error: 'Se requiere un archivo PFX' }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith('.pfx')) {
      return Response.json({ error: 'Solo se aceptan archivos .pfx' }, { status: 400 });
    }

    const dir = join(process.cwd(), 'uploads', 'pfx');
    await mkdir(dir, { recursive: true });

    const filename = `${session.user.empresaId}.pfx`;
    const filepath = join(dir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Guardar ruta en DB
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), session.user.empresaId)
      .input('campo', sql.NVarChar(50), 'pfxPath')
      .input('valor', sql.NVarChar(500), filepath)
      .execute('sp_empresa_setSii');

    return Response.json({ ok: true, filename });
  } catch (e) {
    console.error('[empresa/pfx POST]', e);
    return Response.json({ error: 'Error al guardar el certificado' }, { status: 500 });
  }
}
