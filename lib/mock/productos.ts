import type { Producto, MovimientoStock } from '@/types';

export const mockProductos: Producto[] = [
  { id: 'p-001', sku: 'ACE-001', nombre: 'Varilla de acero A63-42H Ø12mm', categoria: 'Acero', precioVenta: 8500, costoPMP: 6200, stockDisponible: 450, stockReservado: 50, stockMinimo: 100, unidad: 'mt', estado: 'ok' },
  { id: 'p-002', sku: 'ACE-002', nombre: 'Varilla de acero A63-42H Ø20mm', categoria: 'Acero', precioVenta: 14200, costoPMP: 10500, stockDisponible: 85, stockReservado: 20, stockMinimo: 100, unidad: 'mt', estado: 'bajo_minimo' },
  { id: 'p-003', sku: 'CEM-001', nombre: 'Cemento Melón 42.5N', categoria: 'Cemento', precioVenta: 6800, costoPMP: 4900, stockDisponible: 320, stockReservado: 0, stockMinimo: 50, unidad: 'saco', estado: 'ok' },
  { id: 'p-004', sku: 'CEM-002', nombre: 'Cemento Ultra 42.5R (Especial)', categoria: 'Cemento', precioVenta: 8200, costoPMP: 6100, stockDisponible: 0, stockReservado: 0, stockMinimo: 30, unidad: 'saco', estado: 'sin_stock' },
  { id: 'p-005', sku: 'MAD-001', nombre: 'Madera Pino Cepillada 2x4x3.6m', categoria: 'Madera', precioVenta: 4500, costoPMP: 3200, stockDisponible: 200, stockReservado: 30, stockMinimo: 50, unidad: 'un', estado: 'ok' },
  { id: 'p-006', sku: 'MAD-002', nombre: 'Plywood OSB 18mm 1.22x2.44', categoria: 'Madera', precioVenta: 18900, costoPMP: 13500, stockDisponible: 45, stockReservado: 10, stockMinimo: 30, unidad: 'un', estado: 'ok' },
  { id: 'p-007', sku: 'FER-001', nombre: 'Clavo de acero 3" (kilo)', categoria: 'Ferretería', precioVenta: 1200, costoPMP: 850, stockDisponible: 180, stockReservado: 0, stockMinimo: 50, unidad: 'kg', estado: 'ok' },
  { id: 'p-008', sku: 'FER-002', nombre: 'Perno hexagonal M16x60mm + tuerca', categoria: 'Ferretería', precioVenta: 890, costoPMP: 620, stockDisponible: 12, stockReservado: 5, stockMinimo: 50, unidad: 'un', estado: 'bajo_minimo' },
  { id: 'p-009', sku: 'SRV-001', nombre: 'Servicio de topografía (hora)', categoria: 'Servicios', precioVenta: 45000, costoPMP: 32000, stockDisponible: 999, stockReservado: 0, stockMinimo: 0, unidad: 'hr', estado: 'ok' },
  { id: 'p-010', sku: 'SRV-002', nombre: 'Servicio de maquinaria pesada (hr)', categoria: 'Servicios', precioVenta: 85000, costoPMP: 62000, stockDisponible: 999, stockReservado: 0, stockMinimo: 0, unidad: 'hr', estado: 'ok' },
  { id: 'p-011', sku: 'PIN-001', nombre: 'Pintura látex blanca 20L', categoria: 'Pinturas', precioVenta: 32000, costoPMP: 22000, stockDisponible: 28, stockReservado: 4, stockMinimo: 10, unidad: 'balde', estado: 'ok' },
  { id: 'p-012', sku: 'ELE-001', nombre: 'Cable eléctrico 2x2.5mm (metro)', categoria: 'Eléctrico', precioVenta: 1850, costoPMP: 1300, stockDisponible: 350, stockReservado: 100, stockMinimo: 100, unidad: 'mt', estado: 'ok' },
];

export const mockMovimientos: MovimientoStock[] = [
  { id: 'm-001', productoId: 'p-001', productoNombre: 'Varilla de acero Ø12mm', tipo: 'entrada', cantidad: 200, motivo: 'OC-2026-045', fecha: new Date('2026-05-20'), usuario: 'Luis Araya' },
  { id: 'm-002', productoId: 'p-001', productoNombre: 'Varilla de acero Ø12mm', tipo: 'salida', cantidad: 50, motivo: 'Despacho OV-2026-012', fecha: new Date('2026-05-22'), usuario: 'Luis Araya' },
  { id: 'm-003', productoId: 'p-004', productoNombre: 'Cemento Ultra 42.5R', tipo: 'salida', cantidad: 30, motivo: 'Despacho OV-2026-011', fecha: new Date('2026-05-18'), usuario: 'Luis Araya' },
  { id: 'm-004', productoId: 'p-002', productoNombre: 'Varilla de acero Ø20mm', tipo: 'ajuste', cantidad: -5, motivo: 'Ajuste inventario — diferencia conteo físico', fecha: new Date('2026-05-25'), usuario: 'Luis Araya' },
  { id: 'm-005', productoId: 'p-003', productoNombre: 'Cemento Melón', tipo: 'entrada', cantidad: 100, motivo: 'OC-2026-047', fecha: new Date('2026-05-27'), usuario: 'Luis Araya' },
];
