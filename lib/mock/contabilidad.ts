import type { AsientoContable, CuentaCobrar, CuentaPagar } from '@/types';

export const mockAsientos: AsientoContable[] = [
  { id: 'a-001', fecha: new Date('2026-05-02'), numero: 101, glosa: 'Factura 1024 — Minera Atacama SA', debe: 18000000, haber: 0, cuentaCodigo: '1110001', cuentaNombre: 'Clientes', periodo: '2026-05' },
  { id: 'a-002', fecha: new Date('2026-05-02'), numero: 101, glosa: 'Factura 1024 — IVA débito', debe: 0, haber: 2873950, cuentaCodigo: '2210001', cuentaNombre: 'IVA Débito Fiscal', periodo: '2026-05' },
  { id: 'a-003', fecha: new Date('2026-05-02'), numero: 101, glosa: 'Factura 1024 — Ventas netas', debe: 0, haber: 15126050, cuentaCodigo: '4110001', cuentaNombre: 'Ingresos por Ventas', periodo: '2026-05' },
  { id: 'a-004', fecha: new Date('2026-05-05'), numero: 102, glosa: 'Factura 1025 — Supermercados Norte SA', debe: 4200000, haber: 0, cuentaCodigo: '1110001', cuentaNombre: 'Clientes', periodo: '2026-05' },
  { id: 'a-005', fecha: new Date('2026-05-05'), numero: 102, glosa: 'Factura 1025 — IVA débito', debe: 0, haber: 670588, cuentaCodigo: '2210001', cuentaNombre: 'IVA Débito Fiscal', periodo: '2026-05' },
  { id: 'a-006', fecha: new Date('2026-05-05'), numero: 102, glosa: 'Factura 1025 — Ventas netas', debe: 0, haber: 3529412, cuentaCodigo: '4110001', cuentaNombre: 'Ingresos por Ventas', periodo: '2026-05' },
  { id: 'a-007', fecha: new Date('2026-05-15'), numero: 103, glosa: 'OC proveedor Acero Chile SA', debe: 0, haber: 4800000, cuentaCodigo: '2110001', cuentaNombre: 'Proveedores', periodo: '2026-05' },
  { id: 'a-008', fecha: new Date('2026-05-15'), numero: 103, glosa: 'IVA crédito compra Acero Chile', debe: 768000, haber: 0, cuentaCodigo: '1130001', cuentaNombre: 'IVA Crédito Fiscal', periodo: '2026-05' },
  { id: 'a-009', fecha: new Date('2026-05-15'), numero: 103, glosa: 'Gasto compra materiales', debe: 4032000, haber: 0, cuentaCodigo: '5110001', cuentaNombre: 'Costo de Ventas', periodo: '2026-05' },
];

export const mockCxC: CuentaCobrar[] = [
  {
    id: 'cxc-001',
    clienteNombre: 'Minera Atacama SA',
    clienteRut: '78.456.789-0',
    folioDte: 1024,
    fechaEmision: new Date('2026-05-02'),
    fechaVencimiento: new Date('2026-06-01'),
    monto: 18000000,
    saldo: 18000000,
    aging: '0-30',
  },
  {
    id: 'cxc-002',
    clienteNombre: 'Agrícola El Valle SpA',
    clienteRut: '76.987.654-2',
    folioDte: 1028,
    fechaEmision: new Date('2026-05-29'),
    fechaVencimiento: new Date('2026-06-28'),
    monto: 8500000,
    saldo: 8500000,
    aging: '0-30',
  },
  {
    id: 'cxc-003',
    clienteNombre: 'Pesquera del Pacífico Ltda',
    clienteRut: '77.654.321-8',
    folioDte: 998,
    fechaEmision: new Date('2026-04-01'),
    fechaVencimiento: new Date('2026-05-01'),
    monto: 5200000,
    saldo: 5200000,
    aging: '31-60',
  },
  {
    id: 'cxc-004',
    clienteNombre: 'Distribuidora Central Ltda',
    clienteRut: '77.111.222-5',
    folioDte: 945,
    fechaEmision: new Date('2026-02-15'),
    fechaVencimiento: new Date('2026-03-15'),
    monto: 3800000,
    saldo: 3800000,
    aging: '+90',
  },
];

export const mockCxP: CuentaPagar[] = [
  {
    id: 'cxp-001',
    proveedorNombre: 'Proveedor Acero Chile SA',
    proveedorRut: '76.345.678-9',
    folioDte: 3421,
    fechaEmision: new Date('2026-05-24'),
    fechaVencimiento: new Date('2026-06-23'),
    monto: 4800000,
    saldo: 4800000,
  },
  {
    id: 'cxp-002',
    proveedorNombre: 'Ferretería Industrial SRL',
    proveedorRut: '77.234.567-8',
    folioDte: 892,
    fechaEmision: new Date('2026-05-15'),
    fechaVencimiento: new Date('2026-06-14'),
    monto: 1250000,
    saldo: 1250000,
  },
];
