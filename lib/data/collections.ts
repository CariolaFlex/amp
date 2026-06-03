'use client';

/**
 * Registro central de colecciones del ERP.
 * -------------------------------------------------------------------------
 * Todas arrancan VACÍAS (sin seed) → la plataforma parte desde cero.
 * Cada `dateFields` declara qué campos revivir como Date al leer de storage.
 *
 * Para conectar a SQL Server más adelante: ver `lib/data/README` mental →
 * basta reimplementar los métodos de Collection para que hagan fetch a
 * `/api/<entidad>`. El resto de la app no cambia.
 */

import { Collection } from './collection';
import type {
  ClienteMaestro,
  DireccionCliente,
  TelefonoCliente,
  EmailCliente,
  Oportunidad,
  Lead,
  Dte,
  Cotizacion,
  OrdenVenta,
  Producto,
  MovimientoStock,
  OrdenCompra,
  DteProveedor,
  AsientoContable,
  CuentaCobrar,
  CuentaPagar,
  Empleado,
  BHE,
  Proveedor,
  CuentaBancaria,
  MovimientoBancario,
} from '@/types';

const NS = 'amp'; // namespace de localStorage → amp:<entidad>

/* ── CRM ─────────────────────────────────────────────────────── */
export const clientesCol = new Collection<ClienteMaestro>({
  key: `${NS}:clientes`,
  dateFields: ['fechaAlta'],
});

export const direccionesCol = new Collection<DireccionCliente>({
  key: `${NS}:direcciones`,
  dateFields: ['fechaAlta', 'fechaEntrega'],
});

export const telefonosCol = new Collection<TelefonoCliente>({
  key: `${NS}:telefonos`,
  dateFields: ['fechaAlta', 'ultimoContacto'],
});

export const emailsCol = new Collection<EmailCliente>({
  key: `${NS}:emails`,
  dateFields: ['fechaAlta', 'ultimoContacto'],
});

export const oportunidadesCol = new Collection<Oportunidad>({
  key: `${NS}:oportunidades`,
  dateFields: ['ultimaActividad', 'createdAt'],
});

export const leadsCol = new Collection<Lead>({
  key: `${NS}:leads`,
  dateFields: ['createdAt'],
});

/* ── DTE / Ventas ────────────────────────────────────────────── */
export const cotizacionesCol = new Collection<Cotizacion>({
  key: `${NS}:cotizaciones`,
  dateFields: ['fechaEmision'],
});

export const ordenesVentaCol = new Collection<OrdenVenta>({
  key: `${NS}:ordenes_venta`,
  dateFields: ['fechaEmision'],
});

export const dtesCol = new Collection<Dte>({
  key: `${NS}:dtes`,
  dateFields: ['fechaEmision', 'fechaVencimiento'],
});

/* ── Inventario ──────────────────────────────────────────────── */
export const productosCol = new Collection<Producto>({
  key: `${NS}:productos`,
});

export const movimientosCol = new Collection<MovimientoStock>({
  key: `${NS}:movimientos`,
  dateFields: ['fecha'],
});

/* ── Compras ─────────────────────────────────────────────────── */
export const proveedoresCol = new Collection<Proveedor>({
  key: `${NS}:proveedores`,
  dateFields: ['fechaAlta'],
});

export const ordenesCompraCol = new Collection<OrdenCompra>({
  key: `${NS}:ordenes_compra`,
  dateFields: ['fechaEmision'],
});

export const dtesProveedorCol = new Collection<DteProveedor>({
  key: `${NS}:dtes_proveedor`,
  dateFields: ['fechaEmision', 'fechaLimiteAcuse'],
});

/* ── Contabilidad ────────────────────────────────────────────── */
export const asientosCol = new Collection<AsientoContable>({
  key: `${NS}:asientos`,
  dateFields: ['fecha'],
});

/* ── Tesorería ───────────────────────────────────────────────── */
export const cuentasCobrarCol = new Collection<CuentaCobrar>({
  key: `${NS}:cxc`,
  dateFields: ['fechaEmision', 'fechaVencimiento'],
});

export const cuentasPagarCol = new Collection<CuentaPagar>({
  key: `${NS}:cxp`,
  dateFields: ['fechaEmision', 'fechaVencimiento'],
});

export const cuentasBancariasCol = new Collection<CuentaBancaria>({
  key: `${NS}:bancos`,
  dateFields: ['ultimaConciliacion'],
});

export const movimientosBancariosCol = new Collection<MovimientoBancario>({
  key: `${NS}:mov_bancarios`,
  dateFields: ['fecha'],
});

/* ── RRHH ────────────────────────────────────────────────────── */
export const empleadosCol = new Collection<Empleado>({
  key: `${NS}:empleados`,
  dateFields: ['fechaIngreso'],
});

export const bheCol = new Collection<BHE>({
  key: `${NS}:bhe`,
  dateFields: ['fecha'],
});
