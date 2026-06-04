import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

interface CafParsed {
  tipoDte: number;
  desde: number;
  hasta: number;
}

/** Parsea un CAF XML del SII con regex — estructura bien conocida y estable */
function parseCafXml(xml: string): CafParsed | null {
  const td    = xml.match(/<TD>(\d+)<\/TD>/);
  const desde = xml.match(/<D>(\d+)<\/D>/);
  const hasta = xml.match(/<H>(\d+)<\/H>/);
  if (!td || !desde || !hasta) return null;
  return {
    tipoDte: parseInt(td[1]),
    desde: parseInt(desde[1]),
    hasta: parseInt(hasta[1]),
  };
}

/**
 * GET /api/empresa/caf — lista CAFs registrados
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const res = await pool.request()
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .execute('sp_foliocaf_list');
    return Response.json(res.recordset);
  } catch (e) {
    console.error('[empresa/caf GET]', e);
    return Response.json([]);
  }
}

/**
 * POST /api/empresa/caf — sube un archivo CAF XML
 * Body: multipart/form-data { file: .xml }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return Response.json({ error: 'Se requiere un archivo XML' }, { status: 400 });
    }

    const xmlText = await file.text();
    const parsed = parseCafXml(xmlText);
    if (!parsed) {
      return Response.json({ error: 'Archivo CAF inválido — no se encontraron TD, D o H' }, { status: 422 });
    }

    // Guardar XML en disco
    const dir = join(process.cwd(), 'uploads', 'caf');
    await mkdir(dir, { recursive: true });
    const filename = `${session.user.empresaId}_DTE${parsed.tipoDte}.xml`;
    const filepath = join(dir, filename);
    await writeFile(filepath, xmlText, 'utf8');

    // Registrar en DB
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), randomUUID())
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('tipoDte', sql.Int, parsed.tipoDte)
      .input('desde', sql.Int, parsed.desde)
      .input('hasta', sql.Int, parsed.hasta)
      .input('xmlPath', sql.NVarChar(500), filepath)
      .execute('sp_foliocaf_upsert');

    return Response.json({ ok: true, ...parsed });
  } catch (e) {
    console.error('[empresa/caf POST]', e);
    return Response.json({ error: 'Error al procesar el CAF' }, { status: 500 });
  }
}
