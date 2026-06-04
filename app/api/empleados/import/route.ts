import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { parsearNominaCSV } from '@/lib/utils/csv-empleados';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export interface ImportResult {
  importados: number;
  saltados: number;
  errores: string[];
}

/**
 * POST /api/empleados/import
 * Body: multipart/form-data { file: CSV }
 * Parsea la nómina y hace bulk INSERT (uno por uno, transaccional).
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return Response.json({ error: 'Se requiere un archivo CSV' }, { status: 400 });
    }

    const csvText = await file.text();
    const { empleados, errores } = parsearNominaCSV(csvText);

    if (empleados.length === 0) {
      return Response.json({ error: 'No se encontraron empleados válidos', errores }, { status: 422 });
    }

    const pool = await getPool();
    const empresaId = session.user.empresaId;
    let importados = 0;
    const importErrores = [...errores];

    for (const emp of empleados) {
      try {
        await pool.request()
          .input('id', sql.NVarChar(36), randomUUID())
          .input('empresaId', sql.NVarChar(36), empresaId)
          .input('rut', sql.NVarChar(20), emp.rut)
          .input('nombre', sql.NVarChar(200), emp.nombre)
          .input('cargo', sql.NVarChar(100), emp.cargo)
          .input('contrato', sql.NVarChar(50), emp.contrato)
          .input('banco', sql.NVarChar(100), emp.banco)
          .input('numeroCuenta', sql.NVarChar(50), emp.numeroCuenta)
          .input('sueldoBase', sql.BigInt, emp.sueldoBase)
          .input('fechaIngreso', sql.DateTime2, new Date(emp.fechaIngreso))
          .execute('sp_empleados_create');
        importados++;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const isDupe = msg.includes('UNIQUE') || msg.includes('duplicate');
        importErrores.push(`Fila ${emp._fila} (${emp.rut}): ${isDupe ? 'RUT duplicado' : 'Error DB'}`);
      }
    }

    const result: ImportResult = {
      importados,
      saltados: empleados.length - importados,
      errores: importErrores,
    };
    return Response.json(result, { status: importados > 0 ? 201 : 422 });
  } catch (e) {
    console.error('[empleados/import POST]', e);
    return Response.json({ error: 'Error al procesar el archivo' }, { status: 500 });
  }
}
