import { auth } from '@/auth';
import { getPool, sql } from '@/lib/db/mssql';
import { insertarNotificacion } from '@/lib/db/notificaciones';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), id)
      .input('empresaId', sql.NVarChar(36), session.user.empresaId)
      .input('accion', sql.NVarChar(50), body.accion)
      .execute('sp_dtesProveedor_acusar');
    const accionLabel: Record<string, string> = {
      aceptado: 'Aceptado',
      con_reserva: 'Aceptado con reserva',
      reclamado: 'Reclamado',
    };
    void insertarNotificacion({
      empresaId: session.user.empresaId,
      tipo: 'dte_acusado',
      mensaje: `DTE proveedor acusado: ${accionLabel[body.accion as string] ?? body.accion}.`,
    });

    return Response.json({ ok: true });
  } catch (e) {
    console.error('[dte-proveedor PUT]', e);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
