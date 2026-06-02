'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  User, MapPin, Mail, Phone, ChevronLeft, Save, X,
  Star, Plus, Pencil, Trash2, CheckCircle2, Circle, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  mockClientes,
  getClienteById,
  getDireccionesByCliente,
  getTelefonosByCliente,
  getEmailsByCliente,
} from '@/lib/mock/clientes';
import { REGIONES_CHILE, getComunasByRegion } from '@/lib/data/chile-geo';
import { validarRut, formatearRut } from '@/lib/validators/rut';
import type { ClienteMaestro, DireccionCliente, TelefonoCliente, EmailCliente } from '@/types';

type Tab = 'datos' | 'direcciones' | 'telefonos' | 'email';

const TABS = [
  { id: 'datos' as Tab, label: 'Datos Personales', icon: User },
  { id: 'direcciones' as Tab, label: 'Direcciones', icon: MapPin },
  { id: 'email' as Tab, label: 'E-mail', icon: Mail },
  { id: 'telefonos' as Tab, label: 'Teléfonos', icon: Phone },
];

const INTERESES = ['Electrónica', 'Hogar', 'Deportes', 'Moda', 'Libros', 'Jardín', 'Mascotas', 'Salud'];
const ESTADOS_CIVILES = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente civil'];
const NIVELES_ESTUDIO = ['Básica', 'Media', 'Técnico', 'Universitario', 'Postgrado'];
const TIPOS_CLIENTE = ['Bronze', 'Silver', 'Premium', 'Gold', 'VIP'];
const CANALES = ['WhatsApp', 'Email', 'Teléfono', 'Instagram', 'Facebook', 'Tienda física', 'Web'];
const ORIGENES = ['Referido', 'Venta directa', 'Redes sociales', 'Visita comercial', 'Tienda física', 'Web', 'Marketplace'];
const TIPOS_DOMICILIO = ['Particular', 'Comercial', 'Sucursal', 'Bodega', 'Otro'];
const TIPOS_TELEFONO = ['Celular', 'Particular', 'Trabajo', 'Fax', 'Otro'];
const TIPOS_EMAIL = ['Personal', 'Trabajo', 'Facturación', 'Otro'];

function StarRating({ value }: { value?: number }) {
  const v = value ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn('h-4 w-4', i <= Math.floor(v) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">{v.toFixed(1)}</span>
    </div>
  );
}

function formatFecha(d?: Date) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-CL');
}

function formatMonto(n?: number) {
  if (n == null) return '$ 0';
  return `$ ${n.toLocaleString('es-CL')}`;
}

/* ── Tab Datos Personales ─────────────────────────────────── */
function TabDatos({ cliente }: { cliente: ClienteMaestro }) {
  const [tipo, setTipo] = useState(cliente.tipo);
  const [rut, setRut] = useState(cliente.rut ?? '');
  const [rutError, setRutError] = useState('');

  function handleRut(v: string) {
    setRut(v);
    if (v.length < 3) { setRutError(''); return; }
    if (!validarRut(v)) setRutError('RUT inválido (módulo 11)');
    else setRutError('');
  }

  function handleRutBlur() {
    if (rut && !rutError) setRut(formatearRut(rut));
  }

  return (
    <div className="space-y-6">
      {/* Toggle tipo */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tipo de Contribuyente
        </Label>
        <div className="flex items-center gap-2">
          {(['persona_natural', 'empresa'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                tipo === t
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              )}
            >
              <div className={cn('h-2 w-2 rounded-full', tipo === t ? 'bg-primary-foreground' : 'bg-muted-foreground')} />
              {t === 'persona_natural' ? 'Persona Natural' : 'Empresa'}
            </button>
          ))}
        </div>
      </div>

      {/* Campos ID */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label className="text-xs text-muted-foreground">ID Cliente</Label>
          <Input value={cliente.idCliente} readOnly className="bg-muted/50 font-mono text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Fecha Alta</Label>
          <Input value={formatFecha(cliente.fechaAlta)} readOnly className="bg-muted/50 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Antigüedad (meses)</Label>
          <Input value={cliente.antiguedadMeses ?? 0} readOnly className="bg-muted/50 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">RUT / Documento</Label>
          <Input
            value={rut}
            onChange={(e) => handleRut(e.target.value)}
            onBlur={handleRutBlur}
            placeholder="Ej: 12.345.678-9"
            className={cn('font-mono text-sm', rutError && 'border-destructive')}
          />
          {rutError && <p className="mt-1 text-xs text-destructive">{rutError}</p>}
        </div>
      </div>

      {/* Nombre referencial SERVEL */}
      {cliente.nombreReferencial && (
        <div>
          <Label className="text-xs text-muted-foreground">Nombre Referencial (SERVEL)</Label>
          <Input value={cliente.nombreReferencial} readOnly className="bg-amber-50/10 font-mono text-xs text-muted-foreground" />
        </div>
      )}

      {/* Campos persona natural */}
      {tipo === 'persona_natural' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground">Nombres</Label>
            <Input defaultValue={cliente.nombres} placeholder="Ingrese nombres" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Apellidos</Label>
            <Input defaultValue={cliente.apellidos} placeholder="Ingrese apellidos" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Género</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue={cliente.genero}>
              <option value="">Seleccionar...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Estado Civil</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue={cliente.estadoCivil}>
              <option value="">Seleccionar...</option>
              {ESTADOS_CIVILES.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Fecha Nacimiento</Label>
            <Input type="date" defaultValue={cliente.fechaNacimiento} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Edad (calculada)</Label>
            <Input value={cliente.edad ?? '—'} readOnly className="bg-muted/50 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Profesión / Oficio</Label>
            <Input defaultValue={cliente.profesion} placeholder="Ej: Ingeniero Comercial" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Nivel de Estudio</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue={cliente.nivelEstudio}>
              <option value="">Seleccionar...</option>
              {NIVELES_ESTUDIO.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Nacionalidad</Label>
            <Input defaultValue={cliente.nacionalidad} placeholder="Ej: Chilena" />
          </div>
        </div>
      )}

      {/* Campos empresa */}
      {tipo === 'empresa' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Nombre Empresa</Label>
            <Input defaultValue={cliente.nombreEmpresa} placeholder="Nombre de la empresa" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Razón Social</Label>
            <Input defaultValue={cliente.razonSocial} placeholder="Razón social completa" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Giro</Label>
            <Input defaultValue={cliente.giro} placeholder="Giro comercial" />
          </div>
        </div>
      )}

      {/* Clasificaciones y segmentación */}
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-base">📊</span> Clasificaciones y Segmentación
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo de Cliente</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue={cliente.tipoCliente}>
              <option value="">Sin clasificar</option>
              {TIPOS_CLIENTE.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Recencia (días)</Label>
            <Input value={cliente.recencia ?? 0} readOnly className="bg-muted/50 text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Frecuencia (compras)</Label>
            <Input value={cliente.frecuencia ?? 0} readOnly className="bg-muted/50 text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Monto Total</Label>
            <Input value={formatMonto(cliente.montoTotal)} readOnly className="bg-muted/50 text-sm font-mono" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label className="text-xs text-muted-foreground">Satisfacción (CSAT)</Label>
            <StarRating value={cliente.satisfaccionCsat} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Canal Preferido</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue={cliente.canalPreferido}>
              <option value="">Seleccionar...</option>
              {CANALES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Canal de Origen</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue={cliente.canalOrigen}>
              <option value="">Seleccionar...</option>
              {ORIGENES.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Intereses de Compra</Label>
          <div className="flex flex-wrap gap-2">
            {INTERESES.map((i) => (
              <label key={i} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={cliente.interesesCompra?.includes(i)}
                  className="h-3.5 w-3.5 rounded border-border accent-primary"
                />
                <span className="text-sm">{i}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Promoter preferences */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <span className="text-base">🔔</span> Promoter Preferences
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked={cliente.noDeseaPromociones} className="h-4 w-4 accent-primary" />
            <span className="text-sm">No desea recibir promociones</span>
          </label>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <span className="text-base">👥</span> Contacto Referido
          </h3>
          <div>
            <Label className="text-xs text-muted-foreground">Nombre Referido</Label>
            <Input defaultValue={cliente.contactoReferidoNombre} placeholder="Nombre completo" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tab Direcciones ──────────────────────────────────────── */
function TabDirecciones({ clienteId }: { clienteId: string }) {
  const [dirs, setDirs] = useState<DireccionCliente[]>(getDireccionesByCliente(clienteId));
  const [editando, setEditando] = useState<DireccionCliente | null>(null);
  const [regionSel, setRegionSel] = useState('');

  const comunas = getComunasByRegion(regionSel || editando?.region || '');

  function nuevaDireccion() {
    setEditando({
      id: `dir-new-${Date.now()}`, clienteId, tipo: 'Particular',
      calle: '', numero: '', departamento: '', comuna: '', localidad: '',
      region: '', codigoPostal: '', referencia: '',
      esPreferida: false, noDeseaPromociones: false, fechaAlta: new Date(),
    });
    setRegionSel('');
  }

  function guardarDireccion() {
    if (!editando) return;
    setDirs((prev) => {
      const existe = prev.find((d) => d.id === editando.id);
      if (existe) return prev.map((d) => d.id === editando.id ? editando : d);
      if (editando.esPreferida) return [...prev.map((d) => ({ ...d, esPreferida: false })), editando];
      return [...prev, editando];
    });
    setEditando(null);
  }

  function marcarPreferida(id: string) {
    setDirs((prev) => prev.map((d) => ({ ...d, esPreferida: d.id === id })));
  }

  function eliminar(id: string) {
    setDirs((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Datos de Domicilio</h3>
          {!editando && (
            <Button size="sm" onClick={nuevaDireccion}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Nueva dirección
            </Button>
          )}
        </div>
        {editando ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo Domicilio</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={editando.tipo}
                  onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}
                >
                  {TIPOS_DOMICILIO.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Calle</Label>
                {/* Google Places se integra aquí cuando haya API key */}
                <Input
                  value={editando.calle}
                  onChange={(e) => setEditando({ ...editando, calle: e.target.value })}
                  placeholder="Ej: Av. Libertador Bernardo O'Higgins"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Número</Label>
                <Input value={editando.numero} onChange={(e) => setEditando({ ...editando, numero: e.target.value })} placeholder="1234" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Dpto / Edificio</Label>
                <Input value={editando.departamento} onChange={(e) => setEditando({ ...editando, departamento: e.target.value })} placeholder="Depto 402" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Región</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={editando.region}
                  onChange={(e) => {
                    setRegionSel(e.target.value);
                    setEditando({ ...editando, region: e.target.value, comuna: '' });
                  }}
                >
                  <option value="">Seleccionar región...</option>
                  {REGIONES_CHILE.map((r) => <option key={r.codigo} value={r.nombre}>{r.nombre}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Comuna</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={editando.comuna}
                  onChange={(e) => setEditando({ ...editando, comuna: e.target.value })}
                  disabled={!editando.region}
                >
                  <option value="">Seleccionar comuna...</option>
                  {comunas.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Localidad</Label>
                <Input value={editando.localidad} onChange={(e) => setEditando({ ...editando, localidad: e.target.value })} placeholder="Ej: Centro" />
              </div>
              <div className="sm:col-span-3">
                <Label className="text-xs text-muted-foreground">Referencia</Label>
                <Input value={editando.referencia} onChange={(e) => setEditando({ ...editando, referencia: e.target.value })} placeholder="Esquina con calle principal, portón verde" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" checked={editando.esPreferida} onChange={() => setEditando({ ...editando, esPreferida: true })} className="accent-primary" />
                Es Domicilio Preferido
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={editando.noDeseaPromociones} onChange={(e) => setEditando({ ...editando, noDeseaPromociones: e.target.checked })} className="accent-primary" />
                No desea recibir promociones
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={guardarDireccion}>
                <Save className="mr-1 h-3.5 w-3.5" /> Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditando(null)}>
                <X className="mr-1 h-3.5 w-3.5" /> Cancelar
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Seleccione una dirección para editar o cree una nueva.</p>
        )}
      </div>

      {/* Lista */}
      <div className="rounded-lg border overflow-hidden">
        <div className="border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground flex items-center justify-between">
          <span>Registros existentes</span>
          <span>Mostrando {dirs.length} registros</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">TIPO</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">DIRECCIÓN</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">COMUNA/CIUDAD</th>
              <th className="px-4 py-2.5 text-center font-medium text-muted-foreground text-xs">PREFERIDA</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {dirs.map((d) => (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2.5">
                  <Badge variant="outline" className="text-xs">{d.tipo}</Badge>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {d.calle} {d.numero}{d.departamento ? `, ${d.departamento}` : ''}
                  {d.referencia && <span className="block text-xs text-muted-foreground/60">{d.referencia}</span>}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{d.comuna}, {d.region?.split(' ')[1] ?? ''}</td>
                <td className="px-4 py-2.5 text-center">
                  <button onClick={() => marcarPreferida(d.id)}>
                    {d.esPreferida
                      ? <CheckCircle2 className="h-4 w-4 text-primary mx-auto" />
                      : <Circle className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </button>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setEditando(d); setRegionSel(d.region); }}>
                      <Pencil className="h-3 w-3 mr-1" /> Editar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => eliminar(d.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Quitar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {dirs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">Sin direcciones registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Tab Teléfonos ────────────────────────────────────────── */
function TabTelefonos({ clienteId }: { clienteId: string }) {
  const [tels, setTels] = useState<TelefonoCliente[]>(getTelefonosByCliente(clienteId));
  const [editando, setEditando] = useState<TelefonoCliente | null>(null);

  function nuevo() {
    setEditando({
      id: `tel-new-${Date.now()}`, clienteId, tipo: 'Celular',
      telefono: '', formaIngreso: 'manual', observacion: '',
      esPreferido: false, noDeseaPromociones: false, fechaAlta: new Date(),
    });
  }

  function guardar() {
    if (!editando) return;
    setTels((prev) => {
      const existe = prev.find((t) => t.id === editando.id);
      if (editando.esPreferido) {
        const sinPref = existe
          ? prev.map((t) => ({ ...t, esPreferido: t.id === editando.id }))
          : [...prev.map((t) => ({ ...t, esPreferido: false })), editando];
        return sinPref;
      }
      if (existe) return prev.map((t) => t.id === editando.id ? editando : t);
      return [...prev, editando];
    });
    setEditando(null);
  }

  function marcarPreferido(id: string) {
    setTels((prev) => prev.map((t) => ({ ...t, esPreferido: t.id === id })));
  }

  function eliminar(id: string) {
    setTels((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Phone className="h-4 w-4" /> Teléfonos del Cliente
          </h3>
          {!editando && (
            <Button size="sm" onClick={nuevo}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Nuevo teléfono
            </Button>
          )}
        </div>
        {editando ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo Teléfono</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={editando.tipo} onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}>
                  {TIPOS_TELEFONO.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Teléfono</Label>
                <Input
                  value={editando.telefono}
                  onChange={(e) => setEditando({ ...editando, telefono: e.target.value })}
                  placeholder="Ej: +54 9 11 1234 5678"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Forma Ingreso</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={editando.formaIngreso} onChange={(e) => setEditando({ ...editando, formaIngreso: e.target.value as TelefonoCliente['formaIngreso'] })}>
                  <option value="manual">Manual</option>
                  <option value="web_form">Web Form</option>
                  <option value="api">API</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <Label className="text-xs text-muted-foreground">Observación</Label>
                <Input value={editando.observacion} onChange={(e) => setEditando({ ...editando, observacion: e.target.value })} placeholder="Notas adicionales sobre este número..." />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={editando.esPreferido} onChange={(e) => setEditando({ ...editando, esPreferido: e.target.checked })} className="accent-primary" />
                Es Preferido
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={editando.noDeseaPromociones} onChange={(e) => setEditando({ ...editando, noDeseaPromociones: e.target.checked })} className="accent-primary" />
                No desea recibir promociones
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={guardar}><Save className="mr-1 h-3.5 w-3.5" /> Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => setEditando(null)}><X className="mr-1 h-3.5 w-3.5" /> Cancelar</Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Seleccione un teléfono para editar o agregue uno nuevo.</p>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="border-b bg-muted/40 px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Historial de Teléfonos</span>
          <span className="text-xs text-muted-foreground">{tels.length} registros</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {['Fecha Alta', 'Tipo', 'Teléfono', 'Forma Ingreso', 'Último Contacto', 'Preferido', 'Observación', 'Acciones'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tels.map((t) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{formatFecha(t.fechaAlta)}</td>
                <td className="px-3 py-2.5"><Badge variant="outline" className="text-xs">{t.tipo}</Badge></td>
                <td className="px-3 py-2.5 font-mono text-xs">{t.telefono}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground capitalize">{t.formaIngreso.replace('_', ' ')}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{formatFecha(t.ultimoContacto)}</td>
                <td className="px-3 py-2.5 text-center">
                  <button onClick={() => marcarPreferido(t.id)}>
                    {t.esPreferido
                      ? <CheckCircle2 className="h-4 w-4 text-primary mx-auto" />
                      : <Circle className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[140px] truncate">{t.observacion || '—'}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditando(t)}>Editar</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-destructive hover:text-destructive" onClick={() => eliminar(t.id)}>Quitar</Button>
                  </div>
                </td>
              </tr>
            ))}
            {tels.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">Sin teléfonos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Tab Email ────────────────────────────────────────────── */
function TabEmail({ clienteId }: { clienteId: string }) {
  const [emails, setEmails] = useState<EmailCliente[]>(getEmailsByCliente(clienteId));
  const [editando, setEditando] = useState<EmailCliente | null>(null);
  const [confirmacion, setConfirmacion] = useState('');
  const [emailError, setEmailError] = useState('');

  function nuevo() {
    setEditando({
      id: `em-new-${Date.now()}`, clienteId, tipo: 'Personal',
      email: '', esPreferido: false, publicidad: false, observacion: '', fechaAlta: new Date(),
    });
    setConfirmacion('');
    setEmailError('');
  }

  function validarEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function guardar() {
    if (!editando) return;
    if (!validarEmail(editando.email)) { setEmailError('Email inválido'); return; }
    if (editando.email !== confirmacion) { setEmailError('Los emails no coinciden'); return; }
    setEmails((prev) => {
      const existe = prev.find((e) => e.id === editando.id);
      if (editando.esPreferido) {
        const todos = existe
          ? prev.map((e) => ({ ...e, esPreferido: e.id === editando.id }))
          : [...prev.map((e) => ({ ...e, esPreferido: false })), editando];
        return todos;
      }
      if (existe) return prev.map((e) => e.id === editando.id ? editando : e);
      return [...prev, editando];
    });
    setEditando(null);
  }

  function marcarPreferido(id: string) {
    setEmails((prev) => prev.map((e) => ({ ...e, esPreferido: e.id === id })));
  }

  function eliminar(id: string) {
    setEmails((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Mail className="h-4 w-4" /> E-mail del Cliente
          </h3>
          {!editando && (
            <Button size="sm" onClick={nuevo}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Nuevo email
            </Button>
          )}
        </div>
        {editando ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo E-mail</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={editando.tipo} onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}>
                  {TIPOS_EMAIL.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">E-mail</Label>
                <Input
                  type="email"
                  value={editando.email}
                  onChange={(e) => { setEditando({ ...editando, email: e.target.value }); setEmailError(''); }}
                  placeholder="ejemplo@dominio.com"
                  className={emailError ? 'border-destructive' : ''}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Confirmación</Label>
                <Input
                  type="email"
                  value={confirmacion}
                  onChange={(e) => { setConfirmacion(e.target.value); setEmailError(''); }}
                  onPaste={(e) => e.preventDefault()}
                  placeholder="Repita el email"
                  className={emailError ? 'border-destructive' : ''}
                />
              </div>
              {emailError && (
                <p className="sm:col-span-3 text-xs text-destructive">{emailError}</p>
              )}
              <div className="sm:col-span-3">
                <Label className="text-xs text-muted-foreground">Observación</Label>
                <Input value={editando.observacion} onChange={(e) => setEditando({ ...editando, observacion: e.target.value })} placeholder="Notas adicionales sobre este correo..." />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={editando.esPreferido} onChange={(e) => setEditando({ ...editando, esPreferido: e.target.checked })} className="accent-primary" />
                Es Preferido
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={editando.publicidad} onChange={(e) => setEditando({ ...editando, publicidad: e.target.checked })} className="accent-primary" />
                No desea recibir promociones
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={guardar}><Save className="mr-1 h-3.5 w-3.5" /> Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => setEditando(null)}><X className="mr-1 h-3.5 w-3.5" /> Cancelar</Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Seleccione un email para editar o agregue uno nuevo.</p>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="border-b bg-muted/40 px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Lista de Correos Registrados</span>
          <span className="text-xs text-muted-foreground">{emails.length} registros</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {['Fecha Alta', 'Tipo', 'E-mail', 'Último Contacto', 'Preferido', 'Publicidad', 'Observación', 'Acciones'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {emails.map((e) => (
              <tr key={e.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{formatFecha(e.fechaAlta)}</td>
                <td className="px-3 py-2.5"><Badge variant="outline" className="text-xs">{e.tipo}</Badge></td>
                <td className="px-3 py-2.5 font-mono text-xs">{e.email}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{formatFecha(e.ultimoContacto)}</td>
                <td className="px-3 py-2.5 text-center">
                  <button onClick={() => marcarPreferido(e.id)}>
                    {e.esPreferido
                      ? <CheckCircle2 className="h-4 w-4 text-primary mx-auto" />
                      : <Circle className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {e.publicidad
                    ? <CheckCircle2 className="h-4 w-4 text-primary mx-auto" />
                    : <Circle className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[140px] truncate">{e.observacion || '—'}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => { setEditando(e); setConfirmacion(e.email); }}>Editar</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-destructive hover:text-destructive" onClick={() => eliminar(e.id)}>Quitar</Button>
                  </div>
                </td>
              </tr>
            ))}
            {emails.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">Sin emails registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────── */
export default function FichaClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('datos');

  const cliente = getClienteById(id);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const clientesSugeridos = mockClientes.filter((c) => {
    if (!searchQ) return false;
    const nombre = c.tipo === 'empresa'
      ? (c.nombreEmpresa ?? '')
      : `${c.nombres ?? ''} ${c.apellidos ?? ''}`;
    return nombre.toLowerCase().includes(searchQ.toLowerCase()) || (c.rut ?? '').includes(searchQ);
  }).slice(0, 5);

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button variant="outline" onClick={() => router.push('/crm/clientes')}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Volver a Clientes
        </Button>
      </div>
    );
  }

  const nombreDisplay = cliente.tipo === 'empresa'
    ? cliente.nombreEmpresa
    : `${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`.trim();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-3 bg-card flex-shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/crm/clientes">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Datos del Cliente</p>
            <h2 className="font-semibold leading-tight truncate">
              {nombreDisplay || 'Sin nombre'}
            </h2>
          </div>
        </div>

        {/* Buscador de clientes */}
        <div ref={searchRef} className="relative hidden sm:block w-56">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-8 w-full rounded-md border border-border bg-muted/50 pl-8 pr-3 text-xs placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors"
            placeholder="Buscar cliente..."
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
          />
          {searchOpen && clientesSugeridos.length > 0 && (
            <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-card shadow-lg overflow-hidden">
              {clientesSugeridos.map((c) => {
                const nombre = c.tipo === 'empresa'
                  ? c.nombreEmpresa
                  : `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim();
                return (
                  <button
                    key={c.id}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted transition-colors"
                    onClick={() => { router.push(`/crm/clientes/${c.id}`); setSearchOpen(false); setSearchQ(''); }}
                  >
                    <span className="font-medium truncate">{nombre}</span>
                    <span className="ml-auto text-muted-foreground font-mono flex-shrink-0">{c.rut}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href="/crm/clientes">
              <X className="mr-1 h-3.5 w-3.5" /> Cancelar
            </Link>
          </Button>
          <Button size="sm" onClick={() => toast.success('Cliente guardado correctamente')}>
            <Save className="mr-1 h-3.5 w-3.5" /> Guardar
          </Button>
        </div>
      </div>

      {/* Body — sidebar izquierdo de tabs + contenido */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tab sidebar */}
        <aside className="w-48 flex-shrink-0 border-r bg-muted/20 flex flex-col">
          <div className="p-2 pt-3 space-y-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t p-3">
            <Button size="sm" variant="outline" className="w-full text-xs" asChild>
              <Link href="/crm/clientes/nuevo">
                <Plus className="mr-1 h-3 w-3" /> Nuevo Cliente
              </Link>
            </Button>
          </div>
        </aside>

        {/* Contenido del tab */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'datos' && <TabDatos cliente={cliente} />}
          {activeTab === 'direcciones' && <TabDirecciones clienteId={id} />}
          {activeTab === 'telefonos' && <TabTelefonos clienteId={id} />}
          {activeTab === 'email' && <TabEmail clienteId={id} />}
        </main>
      </div>
    </div>
  );
}
