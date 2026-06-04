import sql from 'mssql';

/**
 * Pool singleton de SQL Server.
 * - En desarrollo: localhost\SQLEXPRESS via .env.local
 * - En producción: misma máquina que el servidor Next.js (on-premise)
 *
 * Uso: const pool = await getPool();
 *      const result = await pool.request().execute('sp_nombre');
 */

const config: sql.config = {
  server: process.env.MSSQL_SERVER ?? 'localhost',
  port: process.env.MSSQL_PORT ? parseInt(process.env.MSSQL_PORT) : 1433,
  database: process.env.MSSQL_DATABASE ?? 'AmpueroERP',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.MSSQL_USER ?? 'sa',
      password: process.env.MSSQL_PASSWORD ?? '',
    },
  },
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',
    trustServerCertificate: true,
    connectTimeout: 15000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let _pool: sql.ConnectionPool | null = null;
let _connecting: Promise<sql.ConnectionPool> | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (_pool?.connected) return _pool;

  // Evitar múltiples conexiones simultáneas
  if (_connecting) return _connecting;

  _connecting = (async () => {
    try {
      _pool = new sql.ConnectionPool(config);
      _pool.on('error', (err) => {
        console.error('[mssql] pool error:', err);
        _pool = null;
        _connecting = null;
      });
      await _pool.connect();
      _connecting = null;
      return _pool;
    } catch (err) {
      _pool = null;
      _connecting = null;
      throw err;
    }
  })();

  return _connecting;
}

/** Helper: ejecutar un stored procedure y devolver recordset */
export async function sp<T = Record<string, unknown>>(
  name: string,
  inputs?: Record<string, { type: sql.ISqlType | (() => sql.ISqlType); value: unknown }>,
): Promise<T[]> {
  const pool = await getPool();
  const req = pool.request();
  if (inputs) {
    for (const [key, val] of Object.entries(inputs)) {
      req.input(key, val.type as sql.ISqlType, val.value);
    }
  }
  const result = await req.execute(name);
  return result.recordset as T[];
}

/** Helper: ejecutar un query ad-hoc (usar solo en routes de lectura/diagnóstico) */
export async function query<T = Record<string, unknown>>(sql_: string): Promise<T[]> {
  const pool = await getPool();
  const result = await pool.request().query(sql_);
  return result.recordset as T[];
}

export { sql };
