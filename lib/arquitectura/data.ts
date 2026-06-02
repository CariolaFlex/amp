import type { Node, Edge, MarkerType } from '@xyflow/react';

export type ModuleNodeData = {
  label: string;
  layer: 'db' | 'api' | 'frontend' | 'external';
  module: string;
  items: string[];
  description?: string;
};

// â”€â”€â”€ COLORES POR CAPA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const LAYER_COLORS: Record<ModuleNodeData['layer'], { bg: string; border: string; header: string; text: string; badge: string }> = {
  db: {
    bg: 'bg-blue-950/60',
    border: 'border-blue-700/60',
    header: 'bg-blue-900/80',
    text: 'text-blue-100',
    badge: 'bg-blue-700 text-blue-100',
  },
  api: {
    bg: 'bg-orange-950/60',
    border: 'border-orange-700/60',
    header: 'bg-orange-900/80',
    text: 'text-orange-100',
    badge: 'bg-orange-700 text-orange-100',
  },
  frontend: {
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-700/60',
    header: 'bg-emerald-900/80',
    text: 'text-emerald-100',
    badge: 'bg-emerald-700 text-emerald-100',
  },
  external: {
    bg: 'bg-purple-950/60',
    border: 'border-purple-700/60',
    header: 'bg-purple-900/80',
    text: 'text-purple-100',
    badge: 'bg-purple-700 text-purple-100',
  },
};

// â”€â”€â”€ POSICIONES (4 columnas Ã— 9 filas) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Col 0: DB          x = 0
// Col 1: API         x = 360
// Col 2: Frontend    x = 720
// Col 3: External    x = 1080
// Filas separadas 290px verticalmente

const X = { db: 0, api: 360, frontend: 720, external: 1080 };
const Y = {
  sistema:      0,
  crm:        290,
  ventas:     580,
  inventario: 870,
  compras:   1160,
  contab:    1450,
  tesoreria: 1740,
  rrhh:      2030,
};

// â”€â”€â”€ NODES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const ARQUITECTURA_NODES: Node<ModuleNodeData>[] = [

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DB â€” SISTEMA / AUTH â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    id: 'db_sistema',
    type: 'moduleNode',
    position: { x: X.db, y: Y.sistema },
    data: {
      label: 'Sistema & Auth',
      layer: 'db',
      module: 'SISTEMA',
      description: 'Identidad, roles, empresas, centros de costo',
      items: [
        'tbl_empresa          â€” RUT, razÃ³n social, giro',
        'tbl_centro_costo     â€” sucursales / centros',
        'tbl_usuario          â€” email, hash, activo',
        'tbl_rol              â€” Admin / Vendedor / Contador / RRHH',
        'tbl_usuario_rol      â€” N:M usuario â†” rol',
        'tbl_permiso          â€” granular por mÃ³dulo',
        'tbl_plataforma       â€” instancias multi-tenant',
        'tbl_auditoria        â€” log de acciones crÃ­ticas',
        'tbl_periodo_sistema  â€” fecha contable activa',
      ],
    },
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DB â€” CRM â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    id: 'db_crm',
    type: 'moduleNode',
    position: { x: X.db, y: Y.crm },
    data: {
      label: 'CRM',
      layer: 'db',
      module: 'CRM',
      description: 'Clientes, oportunidades, seguimiento comercial',
      items: [
        'tbl_cliente          â€” RUT, tipo PN/Empresa, RFM',
        'tbl_cliente_dir      â€” cascada RegiÃ³nâ†’Comuna',
        'tbl_cliente_tel      â€” telÃ©fonos mÃºltiples',
        'tbl_cliente_email    â€” emails + confirmaciÃ³n',
        'tbl_prospecto        â€” leads SERVEL / manual',
        'tbl_oportunidad      â€” pipeline, monto, etapa',
        'tbl_etapa_pipeline   â€” Kanban configurable',
        'tbl_actividad        â€” llamadas, visitas, email',
        'tbl_segmento         â€” agrupaciÃ³n marketing',
        'tbl_campana          â€” campaÃ±as comerciales',
        'tbl_nota_cliente     â€” CRM notes timeline',
      ],
    },
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DB â€” VENTAS / DTE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    id: 'db_ventas',
    type: 'moduleNode',
    position: { x: X.db, y: Y.ventas },
    data: {
      label: 'Ventas & DTE',
      layer: 'db',
      module: 'VENTAS',
      description: 'Cotizaciones, Ã³rdenes de venta, facturaciÃ³n electrÃ³nica',
      items: [
        'tbl_cotizacion       â€” COT-YYYY-NNN, vigencia',
        'tbl_cotizacion_det   â€” lÃ­neas, precio, descuento',
        'tbl_orden_venta      â€” OV aprobada desde COT',
        'tbl_orden_venta_det  â€” lÃ­neas confirmadas',
        'tbl_dte              â€” tipo 33/34/39/52/61/56',
        'tbl_dte_det          â€” lÃ­neas DTE con impuestos',
        'tbl_folio_caf        â€” CAFs por tipo de DTE',
        'tbl_tipo_dte         â€” catÃ¡logo tipos SII',
        'tbl_estado_dte       â€” Emitido/Aceptado/Rechazado',
        'tbl_dte_referencia   â€” encadena COTâ†’OVâ†’DTE',
      ],
    },
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DB â€” INVENTARIO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    id: 'db_inventario',
    type: 'moduleNode',
    position: { x: X.db, y: Y.inventario },
    data: {
      label: 'Inventario',
      layer: 'db',
      module: 'INVENTARIO',
      description: 'Productos, stock, bodegas, valorizaciÃ³n',
      items: [
        'tbl_producto         â€” cÃ³digo, nombre, tipo S/P',
        'tbl_categoria        â€” Ã¡rbol de categorÃ­as',
        'tbl_unidad_medida    â€” UN / KG / M2 / LT â€¦',
        'tbl_bodega           â€” ubicaciones fÃ­sicas',
        'tbl_stock            â€” saldo por producto/bodega',
        'tbl_movimiento_stock â€” entrada/salida/traspaso',
        'tbl_lote             â€” trazabilidad por lote',
        'tbl_precio_venta     â€” lista precios vigente',
        'tbl_costo_prom       â€” costo promedio ponderado',
      ],
    },
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DB â€” COMPRAS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    id: 'db_compras',
    type: 'moduleNode',
    position: { x: X.db, y: Y.compras },
    data: {
      label: 'Compras',
      layer: 'db',
      module: 'COMPRAS',
      description: 'Proveedores, Ã³rdenes de compra, recepciones DTE',
      items: [
        'tbl_proveedor        â€” RUT, razÃ³n, giro',
        'tbl_prov_contacto    â€” contactos proveedor',
        'tbl_orden_compra     â€” OC-YYYY-NNN',
        'tbl_orden_compra_det â€” lÃ­neas OC',
        'tbl_recepcion        â€” REC vinculado a OC',
        'tbl_recepcion_det    â€” lÃ­neas recepcionadas',
        'tbl_dte_proveedor    â€” DTE recibido (acuse)',
        'tbl_acuse_recibo     â€” aceptar/con reserva/reclamar (8d)',
        'tbl_devolucion_oc    â€” NC proveedor',
      ],
    },
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DB â€” CONTABILIDAD â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    id: 'db_contab',
    type: 'moduleNode',
    position: { x: X.db, y: Y.contab },
    data: {
      label: 'Contabilidad',
      layer: 'db',
      module: 'CONTABILIDAD',
      description: 'Plan de cuentas, libro diario, mayor, F29',
      items: [
        'tbl_plan_cuenta      â€” Ã¡rbol 4 niveles',
        'tbl_cuenta_tipo      â€” Activo/Pasivo/Patrimonioâ€¦',
        'tbl_periodo_contable â€” Abierto/Cerrado/Bloqueado',
        'tbl_asiento          â€” Nro correlativo + glosa',
        'tbl_asiento_det      â€” cargo/abono por cuenta',
        'tbl_centro_costo_cc  â€” distribuciÃ³n por CC',
        'tbl_f29_codigo       â€” mapa cÃ³digo SII â†” cuenta',
        'tbl_retencion        â€” segunda categorÃ­a, IVA CF/DF',
        'tbl_ajuste_tipo_cambio â€” monedas extranjeras',
      ],
    },
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DB â€” TESORERÃA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    id: 'db_tesoreria',
    type: 'moduleNode',
    position: { x: X.db, y: Y.tesoreria },
    data: {
      label: 'TesorerÃ­a',
      layer: 'db',
      module: 'TESORERÃA',
      description: 'Cuentas bancarias, CxC, CxP, conciliaciÃ³n, flujo caja',
      items: [
        'tbl_banco            â€” BCI / Santander / BancoEstadoâ€¦',
        'tbl_cuenta_banco     â€” nÃºmero, tipo, moneda',
        'tbl_movimiento_banco â€” cartola importada',
        'tbl_conciliacion     â€” estado conciliado/pendiente',
        'tbl_cxc             â€” factura â†’ vencimiento â†’ cobranza',
        'tbl_cxp             â€” OC â†’ acuse â†’ pago proveedor',
        'tbl_pago_cliente    â€” abonos y formas de pago',
        'tbl_pago_proveedor  â€” egresos y cheques',
        'tbl_flujo_caja      â€” proyectado vs real 90d',
        'tbl_tipo_pago       â€” cheque/transferencia/efectivo',
      ],
    },
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DB â€” RRHH â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  {
    id: 'db_rrhh',
    type: 'moduleNode',
    position: { x: X.db, y: Y.rrhh },
    data: {
      label: 'RRHH',
      layer: 'db',
      module: 'RRHH',
      description: 'Empleados, contratos, nÃ³mina, BHE, vacaciones',
      items: [
        'tbl_empleado        â€” RUT, cargo, depto, fecha ingreso',
        'tbl_cargo           â€” tÃ­tulo, grado, banda salarial',
        'tbl_departamento    â€” Ã¡rbol organizacional',
        'tbl_contrato        â€” tipo, vigencia, sueldo base',
        'tbl_nomina          â€” liquidaciÃ³n mensual',
        'tbl_nomina_det      â€” haberes / descuentos / AFP / ISAPRE',
        'tbl_bhe            â€” boleta honorarios, 15.25% retenciÃ³n',
        'tbl_vacacion        â€” saldo, uso, aprobaciÃ³n',
        'tbl_licencia        â€” SIL, reposo, maternal',
        'tbl_prevision       â€” AFP + ISAPRE + AFC',
      ],
    },
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // API â€” BACKEND (Next.js API Routes + Stored Procedures)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  {
    id: 'api_sistema',
    type: 'moduleNode',
    position: { x: X.api, y: Y.sistema },
    data: {
      label: 'Auth & Sistema API',
      layer: 'api',
      module: 'SISTEMA',
      description: 'AutenticaciÃ³n, permisos, configuraciÃ³n multi-empresa',
      items: [
        'POST /api/auth/login        â€” JWT session',
        'POST /api/auth/logout',
        'GET  /api/auth/me           â€” perfil + permisos',
        'GET  /api/empresas          â€” lista instancias',
        'POST /api/empresas          â€” nueva empresa',
        'GET  /api/centros-costo     â€” por empresa',
        'GET  /api/usuarios          â€” gestiÃ³n usuarios',
        'POST /api/usuarios          â€” crear usuario + rol',
        'PUT  /api/usuarios/:id/rol  â€” asignar roles',
        'GET  /api/auditoria         â€” log filtrable',
        'SP   sp_ValidarPermiso      â€” check granular',
      ],
    },
  },

  {
    id: 'api_crm',
    type: 'moduleNode',
    position: { x: X.api, y: Y.crm },
    data: {
      label: 'CRM API',
      layer: 'api',
      module: 'CRM',
      description: 'CRUD clientes, pipeline, actividades, RFM',
      items: [
        'GET  /api/clientes           â€” lista + bÃºsqueda',
        'POST /api/clientes           â€” crear (valida RUT)',
        'GET  /api/clientes/:id       â€” ficha completa',
        'PUT  /api/clientes/:id       â€” actualizar',
        'GET  /api/clientes/:id/dirs  â€” direcciones',
        'POST /api/clientes/:id/dirs',
        'GET  /api/clientes/:id/tels',
        'POST /api/clientes/:id/tels',
        'GET  /api/clientes/:id/mails',
        'GET  /api/oportunidades      â€” pipeline por etapa',
        'POST /api/oportunidades      â€” crear deal',
        'PUT  /api/oportunidades/:id/etapa',
        'GET  /api/actividades        â€” agenda CRM',
        'POST /api/rut/lookup         â€” busca en SERVEL',
        'SP   sp_CalcularRFM          â€” recencia+frecuencia+monto',
        'SP   sp_DealRotting          â€” alerta 14d/21d',
      ],
    },
  },

  {
    id: 'api_ventas',
    type: 'moduleNode',
    position: { x: X.api, y: Y.ventas },
    data: {
      label: 'Ventas & DTE API',
      layer: 'api',
      module: 'VENTAS',
      description: 'Cotizaciones, Ã³rdenes de venta, DTE electrÃ³nico',
      items: [
        'GET  /api/cotizaciones',
        'POST /api/cotizaciones        â€” COT-YYYY-NNN',
        'PUT  /api/cotizaciones/:id/aprobar â†’ crea OV',
        'GET  /api/ordenes-venta',
        'POST /api/ordenes-venta/:id/facturar â†’ DTE',
        'GET  /api/dte               â€” listado + filtros',
        'POST /api/dte/emitir        â€” firma + envÃ­a SII',
        'GET  /api/dte/:id/pdf       â€” genera PDF',
        'GET  /api/dte/:id/xml       â€” XML firmado',
        'POST /api/dte/:id/anular    â€” emite NC vinculada',
        'GET  /api/folios            â€” CAFs disponibles',
        'POST /api/folios/caf        â€” importar .xml CAF',
        'SP   sp_GenerarDTE          â€” timbre + firma',
        'SP   sp_ContabilizarDTE     â€” asiento automÃ¡tico',
      ],
    },
  },

  {
    id: 'api_inventario',
    type: 'moduleNode',
    position: { x: X.api, y: Y.inventario },
    data: {
      label: 'Inventario API',
      layer: 'api',
      module: 'INVENTARIO',
      description: 'Productos, stock por bodega, movimientos',
      items: [
        'GET  /api/productos           â€” catÃ¡logo + filtros',
        'POST /api/productos',
        'PUT  /api/productos/:id',
        'GET  /api/productos/:id/stock â€” saldo por bodega',
        'GET  /api/bodegas',
        'POST /api/movimientos-stock   â€” entrada/salida/tras.',
        'GET  /api/movimientos-stock   â€” historial',
        'GET  /api/stock/alertas       â€” bajo mÃ­nimo',
        'GET  /api/stock/valorizado    â€” costo prom. total',
        'SP   sp_MovimientoStock       â€” actualiza saldo',
        'SP   sp_CostoProm             â€” recalcula CPP',
        'SP   sp_SemÃ¡foroStock         â€” verde/amarillo/rojo',
      ],
    },
  },

  {
    id: 'api_compras',
    type: 'moduleNode',
    position: { x: X.api, y: Y.compras },
    data: {
      label: 'Compras API',
      layer: 'api',
      module: 'COMPRAS',
      description: 'Proveedores, OCs, recepciones, acuse DTE',
      items: [
        'GET  /api/proveedores',
        'POST /api/proveedores',
        'GET  /api/ordenes-compra',
        'POST /api/ordenes-compra      â€” OC-YYYY-NNN',
        'PUT  /api/ordenes-compra/:id/aprobar',
        'POST /api/recepciones         â€” vincula a OC',
        'GET  /api/dte-proveedores     â€” DTE recibidos',
        'POST /api/dte-proveedores/:id/aceptar',
        'POST /api/dte-proveedores/:id/reclamar',
        'GET  /api/dte-proveedores/vencer-acuse â€” alerta 8d',
        'SP   sp_RecibirMercaderia     â€” stock + CxP',
        'SP   sp_ContabilizarCompra    â€” asiento automÃ¡tico',
      ],
    },
  },

  {
    id: 'api_contab',
    type: 'moduleNode',
    position: { x: X.api, y: Y.contab },
    data: {
      label: 'Contabilidad API',
      layer: 'api',
      module: 'CONTABILIDAD',
      description: 'Plan de cuentas, asientos, balance, F29',
      items: [
        'GET  /api/cuentas              â€” plan 4 niveles',
        'POST /api/cuentas',
        'GET  /api/periodos             â€” Abierto/Cerrado',
        'PUT  /api/periodos/:id/cerrar',
        'GET  /api/asientos             â€” libro diario filtrado',
        'POST /api/asientos             â€” asiento manual',
        'GET  /api/libro-mayor          â€” cuenta + saldo corrido',
        'GET  /api/balance              â€” 8 columnas por perÃ­odo',
        'GET  /api/f29                  â€” propuesta F29',
        'POST /api/f29/exportar         â€” XML SII',
        'SP   sp_AsientoAutomatico      â€” ventas/compras/nÃ³mina',
        'SP   sp_CerrarPeriodo          â€” lock + traspaso',
        'SP   sp_GenerarF29             â€” codigos SII',
      ],
    },
  },

  {
    id: 'api_tesoreria',
    type: 'moduleNode',
    position: { x: X.api, y: Y.tesoreria },
    data: {
      label: 'TesorerÃ­a API',
      layer: 'api',
      module: 'TESORERÃA',
      description: 'CxC/CxP, bancos, conciliaciÃ³n, flujo de caja',
      items: [
        'GET  /api/cxc                â€” aging 0-30/31-60/61-90/+90',
        'GET  /api/cxc/:id/cobrar    â€” registrar pago',
        'GET  /api/cxp               â€” pendientes pago',
        'POST /api/cxp/:id/pagar     â€” egresar pago',
        'GET  /api/bancos             â€” saldos bancarios',
        'POST /api/bancos/:id/cartola â€” importar CSV',
        'GET  /api/conciliacion      â€” movimientos vs cartola',
        'PUT  /api/conciliacion/:id/conciliar',
        'GET  /api/flujo-caja        â€” proyecciÃ³n 30/60/90d',
        'GET  /api/flujo-caja/real   â€” vs proyectado',
        'SP   sp_AplicarPago         â€” CxC/CxP + asiento',
        'SP   sp_ConciliarBanco      â€” match automÃ¡tico',
        'SP   sp_FlujoCaja90         â€” proyecciÃ³n',
      ],
    },
  },

  {
    id: 'api_rrhh',
    type: 'moduleNode',
    position: { x: X.api, y: Y.rrhh },
    data: {
      label: 'RRHH API',
      layer: 'api',
      module: 'RRHH',
      description: 'Empleados, contratos, nÃ³mina, BHE, vacaciones',
      items: [
        'GET  /api/empleados',
        'POST /api/empleados',
        'PUT  /api/empleados/:id',
        'GET  /api/contratos/:id',
        'POST /api/nomina/generar      â€” cÃ¡lculo mensual',
        'GET  /api/nomina/:mes         â€” detalle liquidaciÃ³n',
        'GET  /api/nomina/:mes/pdf     â€” liquidaciÃ³n PDF',
        'POST /api/bhe                â€” boleta honorarios',
        'GET  /api/bhe/:id/pdf',
        'GET  /api/vacaciones/:id     â€” saldo empleado',
        'POST /api/vacaciones/solicitar',
        'PUT  /api/vacaciones/:id/aprobar',
        'SP   sp_CalcularLiquidacion  â€” haberes/descuentos',
        'SP   sp_ContabilizarNomina   â€” asiento remuneraciones',
        'SP   sp_CalcularBHE          â€” 15.25% retenciÃ³n',
      ],
    },
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // FRONTEND â€” MÃ“DULOS (pÃ¡ginas implementadas)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  {
    id: 'front_auth',
    type: 'moduleNode',
    position: { x: X.frontend, y: Y.sistema },
    data: {
      label: 'Auth & Setup',
      layer: 'frontend',
      module: 'AUTH',
      description: 'Login, registro, onboarding SII, selecciÃ³n empresa',
      items: [
        '/login                â€” email + contraseÃ±a âœ…',
        '/registro             â€” nuevo usuario âœ…',
        '/onboarding           â€” wizard 6 pasos SII âœ…',
        '  â†’ Paso 1: Datos empresa + RUT',
        '  â†’ Paso 2: Certificado PFX (firma digital)',
        '  â†’ Paso 3: Carga CAFs por tipo DTE',
        '  â†’ Paso 4: Ambiente certif./producciÃ³n',
        '  â†’ Paso 5: DTE de prueba',
        '  â†’ Paso 6: ConfirmaciÃ³n + inicio',
        '[PENDIENTE] SelecciÃ³n plataforma/CC al login',
        '[PENDIENTE] 2FA TOTP',
      ],
    },
  },

  {
    id: 'front_dashboard',
    type: 'moduleNode',
    position: { x: X.frontend, y: Y.crm - 100 },
    data: {
      label: 'Dashboard',
      layer: 'frontend',
      module: 'DASHBOARD',
      description: 'KPIs ejecutivos, alertas crÃ­ticas, grÃ¡ficos',
      items: [
        '/dashboard            â€” KPIs + grÃ¡ficos âœ…',
        '  â†’ Ventas mes (Recharts AreaChart)',
        '  â†’ Pipeline por etapa (BarChart)',
        '  â†’ CxC aging doughnut',
        '  â†’ Stock crÃ­tico alertas',
        '  â†’ DTE por vencer/vencidos',
        '  â†’ Empleados activos',
        'Cmd+K bÃºsqueda global âœ…',
        'Dark mode toggle âœ…',
        '[PENDIENTE] Datos reales desde API',
      ],
    },
  },

  {
    id: 'front_crm',
    type: 'moduleNode',
    position: { x: X.frontend, y: Y.crm + 80 },
    data: {
      label: 'CRM',
      layer: 'frontend',
      module: 'CRM',
      description: 'Pipeline kanban, maestro clientes, leads',
      items: [
        '/crm                  â€” Pipeline Kanban âœ…',
        '  â†’ Drag&drop etapas (@dnd-kit)',
        '  â†’ Deal rotting 14dâš  21dðŸ”´',
        '/crm/lista            â€” Vista tabla pipeline âœ…',
        '/crm/leads            â€” Prospectos/leads âœ…',
        '/crm/clientes         â€” Maestro clientes âœ…',
        '/crm/clientes/nuevo   â€” Crear PN/Empresa âœ…',
        '/crm/clientes/[id]    â€” Ficha 4 tabs âœ…',
        '  â†’ Tab Datos: RUT mÃ³dulo11 + RFM',
        '  â†’ Tab Direcciones: cascada RegiÃ³nâ†’Comuna',
        '  â†’ Tab TelÃ©fonos: CRUD inline',
        '  â†’ Tab Email: sin paste en confirmar',
        '[PENDIENTE] Historial actividades timeline',
        '[PENDIENTE] CampaÃ±as y segmentos',
      ],
    },
  },

  {
    id: 'front_ventas',
    type: 'moduleNode',
    position: { x: X.frontend, y: Y.ventas },
    data: {
      label: 'Ventas & DTE',
      layer: 'frontend',
      module: 'VENTAS',
      description: 'Cotizaciones, Ã³rdenes de venta, facturaciÃ³n electrÃ³nica',
      items: [
        '/dte                  â€” Tabla DTEs âœ…',
        '  â†’ Filtros por estado + tipo',
        '/dte/cotizaciones     â€” Listado COT âœ…',
        '/dte/nueva            â€” Editor cotizaciÃ³n âœ…',
        '  â†’ LÃ­neas editables qty/precio/desc',
        '  â†’ Subtotal + IVA 19% automÃ¡tico',
        '  â†’ Vista previa antes de emitir',
        '[PENDIENTE] /dte/[id]     â€” Ver DTE + acciones',
        '[PENDIENTE] /dte/[id]/pdf â€” Descarga PDF',
        '[PENDIENTE] Flujo COT â†’ OV â†’ DTE encadenado',
        '[PENDIENTE] AnulaciÃ³n con NC automÃ¡tica',
        '[PENDIENTE] LibreDTE / API SII integraciÃ³n',
      ],
    },
  },

  {
    id: 'front_inventario',
    type: 'moduleNode',
    position: { x: X.frontend, y: Y.inventario },
    data: {
      label: 'Inventario',
      layer: 'frontend',
      module: 'INVENTARIO',
      description: 'CatÃ¡logo productos, semÃ¡foro stock, movimientos',
      items: [
        '/inventory            â€” CatÃ¡logo âœ…',
        '  â†’ SemÃ¡foro verde/amarillo/rojo',
        '  â†’ Filtro por categorÃ­a y bodega',
        '/inventory/movimientos â€” Historial âœ…',
        '  â†’ Entrada / Salida / Traspaso',
        '[PENDIENTE] /inventory/[id]   â€” Ficha producto',
        '[PENDIENTE] /inventory/ajuste â€” Toma de inventario',
        '[PENDIENTE] /inventory/bodegas',
        '[PENDIENTE] Export Excel valorizado',
      ],
    },
  },

  {
    id: 'front_compras',
    type: 'moduleNode',
    position: { x: X.frontend, y: Y.compras },
    data: {
      label: 'Compras',
      layer: 'frontend',
      module: 'COMPRAS',
      description: 'Proveedores, OCs, recepciones, acuse de recibo DTE',
      items: [
        '/purchasing           â€” Dashboard compras âœ…',
        '  â†’ Countdown acuse 8 dÃ­as',
        '  â†’ Aceptar / Con Reserva / Reclamar',
        '  â†’ DTEs proveedor recibidos',
        '[PENDIENTE] /purchasing/proveedores',
        '[PENDIENTE] /purchasing/ordenes    â€” OCs',
        '[PENDIENTE] /purchasing/recepciones',
        '[PENDIENTE] Comparador de proveedores',
        '[PENDIENTE] AprobaciÃ³n OC por monto',
      ],
    },
  },

  {
    id: 'front_contab',
    type: 'moduleNode',
    position: { x: X.frontend, y: Y.contab },
    data: {
      label: 'Contabilidad',
      layer: 'frontend',
      module: 'CONTABILIDAD',
      description: 'Libro diario, mayor, balance 8 col., F29',
      items: [
        '/accounting           â€” Libro Diario âœ…',
        '  â†’ Selector perÃ­odo Abierto/Cerrado/Bloqueado',
        '/accounting/mayor     â€” Libro Mayor âœ…',
        '  â†’ Por cuenta + saldo corrido',
        '/accounting/balance   â€” Balance 8 columnas âœ…',
        '  â†’ Exportable (pendiente jsPDF)',
        '/accounting/f29       â€” Propuesta F29 âœ…',
        '  â†’ CÃ³digo SII por cÃ³digo',
        '[PENDIENTE] /accounting/cuentas â€” Plan de cuentas',
        '[PENDIENTE] Asiento manual desde UI',
        '[PENDIENTE] Cierre de perÃ­odo',
        '[PENDIENTE] Export F29 XML SII',
      ],
    },
  },

  {
    id: 'front_tesoreria',
    type: 'moduleNode',
    position: { x: X.frontend, y: Y.tesoreria },
    data: {
      label: 'TesorerÃ­a',
      layer: 'frontend',
      module: 'TESORERÃA',
      description: 'CxC aging, CxP, saldos bancarios, conciliaciÃ³n, flujo caja',
      items: [
        '/treasury             â€” CxC + CxP âœ…',
        '  â†’ Aging 0-30/31-60/61-90/+90d',
        '/treasury/bancos      â€” Bancos âœ…',
        '  â†’ Saldos por cuenta',
        '  â†’ Importar cartola CSV',
        '  â†’ Flujo de caja 30d',
        '[PENDIENTE] ConciliaciÃ³n bancaria UI',
        '[PENDIENTE] Registro de pagos recibidos',
        '[PENDIENTE] ProgramaciÃ³n pagos proveedores',
        '[PENDIENTE] Flujo caja proyectado 90d',
      ],
    },
  },

  {
    id: 'front_rrhh',
    type: 'moduleNode',
    position: { x: X.frontend, y: Y.rrhh },
    data: {
      label: 'RRHH',
      layer: 'frontend',
      module: 'RRHH',
      description: 'Empleados, nÃ³mina, BHE, vacaciones',
      items: [
        '/payroll              â€” Listado empleados âœ…',
        '  â†’ Estado nÃ³mina por mes',
        '/payroll/bhe          â€” BHE honorarios âœ…',
        '  â†’ CÃ¡lculo 15.25% retenciÃ³n',
        '[PENDIENTE] /payroll/[id]       â€” Ficha empleado',
        '[PENDIENTE] /payroll/liquidacion â€” Ver + PDF',
        '[PENDIENTE] /payroll/vacaciones  â€” Saldo + solicitud',
        '[PENDIENTE] Import Buk/Talana CSV',
        '[PENDIENTE] Contrato digital + firma',
      ],
    },
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // EXTERNAL â€” Integraciones externas
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  {
    id: 'ext_sii',
    type: 'moduleNode',
    position: { x: X.external, y: Y.sistema },
    data: {
      label: 'SII Chile',
      layer: 'external',
      module: 'EXTERNO',
      description: 'Servicio de Impuestos Internos â€” DTE, CAF, F29',
      items: [
        'Ambiente: certif. + producciÃ³n',
        'ws.sii.cl/WSDTE/DTEUpload â€” emitir DTE',
        'Consulta estado DTE (SOAP)',
        'Descarga CAFs por tipo',
        'Portal F29 (manual / API futura)',
        'ValidaciÃ³n RUT (ws.sii.cl/wssii)',
        'Timbre electrÃ³nico (PDF417)',
        'Certificado PFX empresa',
      ],
    },
  },

  {
    id: 'ext_servel',
    type: 'moduleNode',
    position: { x: X.external, y: Y.crm },
    data: {
      label: 'SERVEL / RUT',
      layer: 'external',
      module: 'EXTERNO',
      description: 'PadrÃ³n electoral â€” lookup RUT â†’ nombre',
      items: [
        'Base ~1M registros (Carlos)',
        'Import inicial a SQL Server',
        'Tabla: tbl_servel_padron',
        'SP sp_BuscarRUT â€” autocomplete',
        'Uso: creaciÃ³n clientes + prospectos',
        'ActualizaciÃ³n anual (SRE)',
      ],
    },
  },

  {
    id: 'ext_rrhh_api',
    type: 'moduleNode',
    position: { x: X.external, y: Y.rrhh },
    data: {
      label: 'Talana / Buk',
      layer: 'external',
      module: 'EXTERNO',
      description: 'Motor externo de RRHH â€” nÃ³mina, contratos, PrevRed',
      items: [
        'OpciÃ³n A: Talana (empresa)',
        'OpciÃ³n B: Buk (pyme)',
        'Import liquidaciones â†’ CSV',
        'Previred: declaraciÃ³n AFP/ISAPRE',
        'PrevRed: API AFP integraciÃ³n',
        'No construimos motor propio',
        'AmpueroERP muestra + registra',
        'EnvÃ­a datos â†’ proveedor externo',
      ],
    },
  },

  {
    id: 'ext_bancos',
    type: 'moduleNode',
    position: { x: X.external, y: Y.tesoreria },
    data: {
      label: 'Bancos Chile',
      layer: 'external',
      module: 'EXTERNO',
      description: 'Cartolas bancarias, APIs bancarias (OpenFinance)',
      items: [
        'Fase 1: Import CSV manual (âœ… UI lista)',
        'BCI â€” CSV cartola',
        'Santander â€” CSV cartola',
        'BancoEstado â€” CSV cartola',
        'Scotiabank â€” CSV cartola',
        'Fase 2: OpenFinance Chile (CMF)',
        'API directa cuando CMF lo regule',
        'Match automÃ¡tico SP â€” 95%+ precision',
      ],
    },
  },
];

// â”€â”€â”€ EDGES â€” Conexiones DB â†’ API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DB_TO_API: Edge[] = [
  { id: 'e_db_api_sistema',   source: 'db_sistema',   target: 'api_sistema',   type: 'smoothstep', animated: true,  style: { stroke: '#3b82f6', strokeWidth: 2 }, label: 'mssql' },
  { id: 'e_db_api_crm',      source: 'db_crm',       target: 'api_crm',       type: 'smoothstep', animated: false, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e_db_api_ventas',   source: 'db_ventas',    target: 'api_ventas',    type: 'smoothstep', animated: false, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e_db_api_inv',      source: 'db_inventario',target: 'api_inventario',type: 'smoothstep', animated: false, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e_db_api_compras',  source: 'db_compras',   target: 'api_compras',   type: 'smoothstep', animated: false, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e_db_api_contab',   source: 'db_contab',    target: 'api_contab',    type: 'smoothstep', animated: false, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e_db_api_tesoreria',source: 'db_tesoreria', target: 'api_tesoreria', type: 'smoothstep', animated: false, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e_db_api_rrhh',     source: 'db_rrhh',      target: 'api_rrhh',      type: 'smoothstep', animated: false, style: { stroke: '#3b82f6', strokeWidth: 2 } },
];

// â”€â”€â”€ EDGES â€” API â†’ Frontend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const API_TO_FRONT: Edge[] = [
  { id: 'e_api_front_sistema',   source: 'api_sistema',   target: 'front_auth',       type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e_api_front_crm',      source: 'api_crm',       target: 'front_crm',        type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e_api_front_ventas',   source: 'api_ventas',    target: 'front_ventas',     type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e_api_front_inv',      source: 'api_inventario',target: 'front_inventario', type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e_api_front_compras',  source: 'api_compras',   target: 'front_compras',    type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e_api_front_contab',   source: 'api_contab',    target: 'front_contab',     type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e_api_front_tesoreria',source: 'api_tesoreria', target: 'front_tesoreria',  type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e_api_front_rrhh',     source: 'api_rrhh',      target: 'front_rrhh',       type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e_api_front_dash',     source: 'api_sistema',   target: 'front_dashboard',  type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 } },
];

// â”€â”€â”€ EDGES â€” API â†’ Externos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const API_TO_EXT: Edge[] = [
  { id: 'e_api_sii',    source: 'api_ventas',    target: 'ext_sii',      type: 'smoothstep', animated: true,  style: { stroke: '#a855f7', strokeWidth: 2 }, label: 'SOAP/REST' },
  { id: 'e_api_sii2',  source: 'api_sistema',   target: 'ext_sii',      type: 'smoothstep', style: { stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '4 4' } },
  { id: 'e_api_servel',source: 'api_crm',       target: 'ext_servel',   type: 'smoothstep', animated: true,  style: { stroke: '#a855f7', strokeWidth: 2 }, label: 'SQL local' },
  { id: 'e_api_talana',source: 'api_rrhh',      target: 'ext_rrhh_api', type: 'smoothstep', style: { stroke: '#a855f7', strokeWidth: 2 } },
  { id: 'e_api_bancos',source: 'api_tesoreria', target: 'ext_bancos',   type: 'smoothstep', style: { stroke: '#a855f7', strokeWidth: 2 } },
];

// â”€â”€â”€ EDGES â€” Cross-mÃ³dulo (lÃ³gica de negocio) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Estas conexiones son las mÃ¡s importantes â€” muestran cÃ³mo un mÃ³dulo genera
// datos en otro automÃ¡ticamente (stored procedures + triggers)
const CROSS_MODULE: Edge[] = [
  // Ventas â†’ Inventario (DTE descuenta stock)
  {
    id: 'cx_ventas_inv',
    source: 'db_ventas',
    target: 'db_inventario',
    type: 'smoothstep',
    style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 3' },
    label: 'DTE â†’ descuenta stock',
    labelStyle: { fill: '#f59e0b', fontSize: 10, fontWeight: 600 },
    markerEnd: { type: 'arrowclosed' as MarkerType },
  },
  // Ventas â†’ TesorerÃ­a (DTE genera CxC)
  {
    id: 'cx_ventas_teso',
    source: 'db_ventas',
    target: 'db_tesoreria',
    type: 'smoothstep',
    style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 3' },
    label: 'Factura â†’ genera CxC',
    labelStyle: { fill: '#f59e0b', fontSize: 10, fontWeight: 600 },
    markerEnd: { type: 'arrowclosed' as MarkerType },
  },
  // Ventas â†’ Contabilidad (DTE genera asiento automÃ¡tico)
  {
    id: 'cx_ventas_cont',
    source: 'db_ventas',
    target: 'db_contab',
    type: 'smoothstep',
    style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 3' },
    label: 'DTE â†’ asiento contable',
    labelStyle: { fill: '#f59e0b', fontSize: 10, fontWeight: 600 },
    markerEnd: { type: 'arrowclosed' as MarkerType },
  },
  // Compras â†’ Inventario (recepciÃ³n suma stock)
  {
    id: 'cx_compras_inv',
    source: 'db_compras',
    target: 'db_inventario',
    type: 'smoothstep',
    style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '6 3' },
    label: 'RecepciÃ³n â†’ suma stock',
    labelStyle: { fill: '#ef4444', fontSize: 10, fontWeight: 600 },
    markerEnd: { type: 'arrowclosed' as MarkerType },
  },
  // Compras â†’ TesorerÃ­a (DTE proveedor genera CxP)
  {
    id: 'cx_compras_teso',
    source: 'db_compras',
    target: 'db_tesoreria',
    type: 'smoothstep',
    style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '6 3' },
    label: 'DTE proveedor â†’ CxP',
    labelStyle: { fill: '#ef4444', fontSize: 10, fontWeight: 600 },
    markerEnd: { type: 'arrowclosed' as MarkerType },
  },
  // Compras â†’ Contabilidad
  {
    id: 'cx_compras_cont',
    source: 'db_compras',
    target: 'db_contab',
    type: 'smoothstep',
    style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '6 3' },
    label: 'Compra â†’ asiento CF',
    labelStyle: { fill: '#ef4444', fontSize: 10, fontWeight: 600 },
    markerEnd: { type: 'arrowclosed' as MarkerType },
  },
  // TesorerÃ­a â†’ Contabilidad (pagos generan asientos)
  {
    id: 'cx_teso_cont',
    source: 'db_tesoreria',
    target: 'db_contab',
    type: 'smoothstep',
    style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '6 3' },
    label: 'Pago â†’ asiento banco',
    labelStyle: { fill: '#8b5cf6', fontSize: 10, fontWeight: 600 },
    markerEnd: { type: 'arrowclosed' as MarkerType },
  },
  // RRHH â†’ Contabilidad (nÃ³mina genera asiento)
  {
    id: 'cx_rrhh_cont',
    source: 'db_rrhh',
    target: 'db_contab',
    type: 'smoothstep',
    style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '6 3' },
    label: 'NÃ³mina â†’ asiento remun.',
    labelStyle: { fill: '#ec4899', fontSize: 10, fontWeight: 600 },
    markerEnd: { type: 'arrowclosed' as MarkerType },
  },
  // CRM â†’ Ventas (oportunidad ganada â†’ cotizaciÃ³n)
  {
    id: 'cx_crm_ventas',
    source: 'db_crm',
    target: 'db_ventas',
    type: 'smoothstep',
    style: { stroke: '#06b6d4', strokeWidth: 2, strokeDasharray: '6 3' },
    label: 'Opp. ganada â†’ COT',
    labelStyle: { fill: '#06b6d4', fontSize: 10, fontWeight: 600 },
    markerEnd: { type: 'arrowclosed' as MarkerType },
  },
  // CRM â†’ Contabilidad (RFM desde ventas histÃ³ricas)
  {
    id: 'cx_ventas_crm',
    source: 'db_ventas',
    target: 'db_crm',
    type: 'smoothstep',
    style: { stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4' },
    label: 'Facturas â†’ RFM cliente',
    labelStyle: { fill: '#06b6d4', fontSize: 9 },
    markerEnd: { type: 'arrowclosed' as MarkerType },
  },
  // Sistema â†’ todos (multi-empresa / auth)
  {
    id: 'cx_sis_crm',
    source: 'db_sistema',
    target: 'db_crm',
    type: 'smoothstep',
    style: { stroke: '#64748b', strokeWidth: 1, strokeDasharray: '3 3' },
    label: 'empresa_id (FK)',
    labelStyle: { fill: '#64748b', fontSize: 9 },
  },
];

export const ARQUITECTURA_EDGES: Edge[] = [
  ...DB_TO_API,
  ...API_TO_FRONT,
  ...API_TO_EXT,
  ...CROSS_MODULE,
];

