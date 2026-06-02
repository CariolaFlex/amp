import type { Empleado, BHE } from '@/types';

export const mockEmpleados: Empleado[] = [
  {
    id: 'emp-001',
    rut: '14.567.890-1',
    nombre: 'Miguel Ángel Contreras',
    cargo: 'Jefe de Obra',
    contrato: 'indefinido',
    banco: 'Banco de Chile',
    numeroCuenta: '00-123-45678-90',
    sueldoBase: 1850000,
    fechaIngreso: new Date('2020-03-01'),
  },
  {
    id: 'emp-002',
    rut: '16.234.567-8',
    nombre: 'Sofía Castillo Vega',
    cargo: 'Asistente Administrativa',
    contrato: 'indefinido',
    banco: 'Banco Santander',
    numeroCuenta: '67890123',
    sueldoBase: 750000,
    fechaIngreso: new Date('2022-08-15'),
  },
];

export const mockBHEs: BHE[] = [
  {
    id: 'bhe-001',
    rut: '11.234.567-K',
    nombre: 'Ricardo Vásquez Muñoz',
    periodo: 'Mayo 2026',
    montoBruto: 1200000,
    retencion: 183000,
    montoLiquido: 1017000,
    fecha: new Date('2026-05-31'),
  },
];
