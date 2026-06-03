export type Rol = 'owner' | 'admin' | 'contador' | 'vendedor' | 'bodeguero';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  avatar?: string;
}

/**
 * Credencial de usuario (capa auth). En esta fase la "password" se guarda
 * tal cual en localStorage SÓLO para el demo local; al conectar el backend
 * SQL Server la validación se hace contra el servidor y este campo desaparece.
 */
export interface CuentaUsuario extends Usuario {
  empresaId: string;
  password: string; // demo-only
  activo: boolean;
  fechaAlta: Date;
}

export interface Empresa {
  id: string;
  rut: string;
  razonSocial: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad: string;
}

/** Plataforma = tenant/empresa operativa que el usuario puede seleccionar. */
export interface Plataforma {
  id: string;
  empresaId: string;
  nombre: string;
  rut: string;
}

/** Centro de costo dentro de una plataforma/empresa. */
export interface CentroCosto {
  id: string;
  plataformaId: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}

/** Contexto operativo activo tras el login (requisito Carlos). */
export interface ContextoSesion {
  plataformaId: string;
  plataformaNombre: string;
  centroCostoId: string;
  centroCostoNombre: string;
}

/* ── CRM ─────────────────────────────────────────────────── */
export type EtapaPipeline =
  | 'prospeccion'
  | 'calificado'
  | 'cotizacion_enviada'
  | 'negociacion'
  | 'ganada'
  | 'perdida';

export interface Oportunidad {
  id: string;
  titulo: string;
  clienteNombre: string;
  clienteRut: string;
  monto: number;
  etapa: EtapaPipeline;
  probabilidad: number;
  vendedorId: string;
  vendedorNombre: string;
  ultimaActividad: Date;
  createdAt: Date;
  notas?: string;
}

export interface Lead {
  id: string;
  nombre: string;
  empresa: string;
  rut?: string;
  email?: string;
  telefono?: string;
  fuente: string;
  createdAt: Date;
}

export interface Contacto {
  id: string;
  nombre: string;
  empresaId: string;
  empresaNombre: string;
  rut?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
}

export interface EmpresaCliente {
  id: string;
  rut: string;
  nombre: string;
  giro?: string;
  direccion?: string;
  contactoPrincipal?: string;
}

/* ── DTE ─────────────────────────────────────────────────── */
export type TipoDte = 33 | 34 | 39 | 52 | 56 | 61;
export type EstadoDte =
  | 'borrador'
  | 'pendiente'
  | 'enviado_sii'
  | 'aceptado'
  | 'rechazado'
  | 'anulado'
  | 'pagado';

export interface LineaDte {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  total: number;
  productoId?: string;   // si la línea proviene de un producto del inventario
}

export interface Dte {
  id: string;
  folio: number;
  tipo: TipoDte;
  estado: EstadoDte;
  clienteRut: string;
  clienteNombre: string;
  fechaEmision: Date;
  fechaVencimiento?: Date;
  neto: number;
  iva: number;
  total: number;
  lineas: LineaDte[];
  vendedorId?: string;
  ordenVentaId?: string;   // origen en el flujo Cotización→OV→DTE
}

/* ── Flujo de ventas: Cotización → Orden de Venta → DTE ───── */
export type EstadoCotizacion = 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'convertida';

export interface Cotizacion {
  id: string;
  numero: string;          // COT-YYYY-NNN
  clienteId?: string;
  clienteNombre: string;
  clienteRut: string;
  tipoDte: TipoDte;
  fechaEmision: Date;
  condicionPago?: string;
  lineas: LineaDte[];
  neto: number;
  iva: number;
  total: number;
  notas?: string;
  estado: EstadoCotizacion;
  vendedorId?: string;
  vendedorNombre?: string;
  ordenVentaId?: string;   // set al convertir
}

export type EstadoOV = 'pendiente' | 'facturada' | 'anulada';

export interface OrdenVenta {
  id: string;
  numero: string;          // OV-YYYY-NNN
  cotizacionId?: string;
  clienteId?: string;
  clienteNombre: string;
  clienteRut: string;
  tipoDte: TipoDte;
  fechaEmision: Date;
  lineas: LineaDte[];
  neto: number;
  iva: number;
  total: number;
  estado: EstadoOV;
  dteId?: string;          // set al emitir DTE
  vendedorNombre?: string;
}

/* ── Inventario ──────────────────────────────────────────── */
export type EstadoStock = 'ok' | 'bajo_minimo' | 'sin_stock';

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  precioVenta: number;
  costoPMP: number;
  stockDisponible: number;
  stockReservado: number;
  stockMinimo: number;
  unidad: string;
  estado: EstadoStock;
}

export interface MovimientoStock {
  id: string;
  productoId: string;
  productoNombre: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  cantidad: number;
  motivo?: string;
  fecha: Date;
  usuario: string;
}

/* ── Compras ─────────────────────────────────────────────── */
export interface Proveedor {
  id: string;
  rut: string;
  razonSocial: string;
  giro?: string;
  direccion?: string;
  comuna?: string;
  region?: string;
  contactoNombre?: string;
  contactoEmail?: string;
  contactoTelefono?: string;
  condicionPago?: string; // contado / 30 días / 60 días
  activo: boolean;
  fechaAlta: Date;
}

export type EstadoOC = 'borrador' | 'aprobada' | 'recibida' | 'facturada';

export interface OrdenCompra {
  id: string;
  numero: string;
  proveedorRut: string;
  proveedorNombre: string;
  estado: EstadoOC;
  fechaEmision: Date;
  total: number;
}

export interface DteProveedor {
  id: string;
  folio: number;
  proveedorRut: string;
  proveedorNombre: string;
  fechaEmision: Date;
  fechaLimiteAcuse: Date;
  total: number;
  estado: 'pendiente_acuse' | 'aceptado' | 'aceptado_con_reserva' | 'reclamado';
}

/* ── Contabilidad ────────────────────────────────────────── */
export interface AsientoContable {
  id: string;
  fecha: Date;
  numero: number;
  glosa: string;
  debe: number;
  haber: number;
  cuentaCodigo: string;
  cuentaNombre: string;
  periodo: string;
}

/* ── Tesorería ───────────────────────────────────────────── */
export type BucketAging = '0-30' | '31-60' | '61-90' | '+90';

export interface CuentaCobrar {
  id: string;
  clienteNombre: string;
  clienteRut: string;
  folioDte: number;
  fechaEmision: Date;
  fechaVencimiento: Date;
  monto: number;
  saldo: number;
  aging: BucketAging;
}

export interface CuentaPagar {
  id: string;
  proveedorNombre: string;
  proveedorRut: string;
  folioDte: number;
  fechaEmision: Date;
  fechaVencimiento: Date;
  monto: number;
  saldo: number;
}

/* ── Maestro Clientes ────────────────────────────────────── */
export type TipoContribuyente = 'persona_natural' | 'empresa';

export interface ClienteMaestro {
  id: string;
  tipo: TipoContribuyente;
  // Persona natural
  nombres?: string;
  apellidos?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  estadoCivil?: string;
  fechaNacimiento?: string; // ISO date string
  edad?: number;            // calculado
  profesion?: string;
  nivelEstudio?: string;
  nacionalidad?: string;
  // Empresa
  nombreEmpresa?: string;
  razonSocial?: string;
  giro?: string;
  // Compartido
  rut?: string;
  nombreReferencial?: string; // read-only, del SERVEL
  idCliente: string;
  fechaAlta: Date;
  antiguedadMeses?: number;   // calculado desde primera venta
  // Clasificación RFM
  tipoCliente?: string;       // gold/silver/etc (customizable)
  recencia?: number;          // días desde última compra
  frecuencia?: number;        // cantidad de compras
  montoTotal?: number;
  satisfaccionCsat?: number;
  canalPreferido?: string;
  canalOrigen?: string;
  interesesCompra?: string[];
  // Preferencias
  noDeseaPromociones: boolean;
  contactoReferidoNombre?: string;
  // Computed (para lista)
  emailPrincipal?: string;
  telefonoPrincipal?: string;
}

export interface DireccionCliente {
  id: string;
  clienteId: string;
  tipo: string;            // Particular / Comercial / etc
  calle: string;
  numero: string;
  departamento?: string;
  comuna: string;
  localidad?: string;
  region: string;
  codigoPostal?: string;
  referencia?: string;
  esPreferida: boolean;
  noDeseaPromociones: boolean;
  fechaAlta: Date;
  fechaEntrega?: Date;
}

export interface TelefonoCliente {
  id: string;
  clienteId: string;
  tipo: string;            // Celular / Particular / Trabajo
  telefono: string;        // +56 9 XXXX XXXX
  formaIngreso: 'manual' | 'web_form' | 'api';
  observacion?: string;
  esPreferido: boolean;
  noDeseaPromociones: boolean;
  fechaAlta: Date;
  ultimoContacto?: Date;
}

export interface EmailCliente {
  id: string;
  clienteId: string;
  tipo: string;            // Personal / Trabajo
  email: string;
  esPreferido: boolean;
  publicidad: boolean;
  observacion?: string;
  fechaAlta: Date;
  ultimoContacto?: Date;
}

/* ── Bancos / Tesorería ──────────────────────────────────── */
export interface CuentaBancaria {
  id: string;
  banco: string;
  numero: string;
  tipo: string;            // Cuenta Corriente / Vista / Ahorro
  saldo: number;
  ultimaConciliacion?: Date;
}

export interface MovimientoBancario {
  id: string;
  cuentaId: string;
  fecha: Date;
  descripcion: string;
  monto: number;           // positivo = abono, negativo = cargo
  tipo: 'abono' | 'cargo';
}

/* ── RRHH ────────────────────────────────────────────────── */
export type TipoContrato = 'indefinido' | 'plazo_fijo' | 'obra_faena';

export interface Empleado {
  id: string;
  rut: string;
  nombre: string;
  cargo: string;
  contrato: TipoContrato;
  banco: string;
  numeroCuenta: string;
  sueldoBase: number;
  fechaIngreso: Date;
}

export interface BHE {
  id: string;
  rut: string;
  nombre: string;
  periodo: string;
  montoBruto: number;
  retencion: number;
  montoLiquido: number;
  fecha: Date;
}
