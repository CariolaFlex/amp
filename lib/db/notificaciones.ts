import { getPool, sql } from './mssql';
import { randomUUID } from 'crypto';

export type TipoNotificacion =
  | 'dte_emitido'
  | 'dte_recibido'
  | 'dte_acusado'
  | 'oc_creada';

/** Inserta una notificación en background — nunca lanza si falla (no romper la operación principal). */
export async function insertarNotificacion(params: {
  empresaId: string;
  usuarioId?: string;
  tipo: TipoNotificacion;
  mensaje: string;
}): Promise<void> {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar(36), randomUUID())
      .input('empresaId', sql.NVarChar(36), params.empresaId)
      .input('usuarioId', sql.NVarChar(36), params.usuarioId ?? null)
      .input('tipo', sql.NVarChar(50), params.tipo)
      .input('mensaje', sql.NVarChar(500), params.mensaje)
      .execute('sp_notificaciones_create');
  } catch (e) {
    console.error('[notificaciones] insert failed (non-fatal):', e);
  }
}
