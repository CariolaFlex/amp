import type { Empresa, Usuario } from '@/types';

export const mockEmpresa: Empresa = {
  id: 'emp-001',
  rut: '76.123.456-7',
  razonSocial: 'Constructora Los Andes SpA',
  giro: 'Construcción de edificios y obras de ingeniería',
  direccion: 'Av. Balmaceda 1234, Of. 301',
  comuna: 'La Serena',
  ciudad: 'La Serena',
};

export const mockUsuarioActual: Usuario = {
  id: 'usr-001',
  nombre: 'Carlos Ampuero',
  email: 'carlos@losandes.cl',
  rol: 'owner',
};

export const mockUsuarios: Usuario[] = [
  mockUsuarioActual,
  { id: 'usr-002', nombre: 'María González', email: 'maria@losandes.cl', rol: 'vendedor' },
  { id: 'usr-003', nombre: 'Pablo Reyes', email: 'pablo@losandes.cl', rol: 'vendedor' },
  { id: 'usr-004', nombre: 'Andrea Molina', email: 'andrea@losandes.cl', rol: 'vendedor' },
  { id: 'usr-005', nombre: 'Jorge Fuentes', email: 'jorge@losandes.cl', rol: 'contador' },
  { id: 'usr-006', nombre: 'Luis Araya', email: 'luis@losandes.cl', rol: 'bodeguero' },
];
