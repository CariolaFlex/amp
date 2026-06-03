'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  User, MapPin, Mail, Phone, ChevronLeft, Save, X,
  Star, Plus, Pencil, Trash2, CheckCircle2, Circle, Search, Activity,
} from 'lucide-react';
import { TabActividadCliente } from '@/components/crm/TabActividadCliente';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  clientesCol,
  direccionesCol,
  telefonosCol,
  emailsCol,
  useCliente,
  useClientes,
  useDireccionesByCliente,
  useTelefonosByCliente,
  useEmailsByCliente,
  nombreCliente,
} from '@/lib/data/clientes';
import { REGIONES_CHILE, getComunasByRegion } from '@/lib/data/chile-geo';
import { validarRut, formatearRut } from '@/lib/validators/rut';
import type { ClienteMaestro, DireccionCliente, TelefonoCliente, EmailCliente, TipoContribuyente } from '@/types';

type Tab = 'datos' | 'direcciones' | 'telefonos' | 'email' | 'actividad';

const TABS = [
  { id: 'datos' as Tab, label: 'Datos Personales', icon: User },
  { id: 'direcciones' as Tab, label: 'Direcciones', icon: MapPin },
  { id: 'email' as Tab, label: 'E-mail', icon: Mail },
  { id: 'telefonos' as Tab, label: 'Teléfonos', icon: Phone },
  { id: 'actividad' as Tab, label: 'Actividad comercial', icon: Activity },
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

const selectClass = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm';

function StarRating({ value, onChange }: { value?: number; onChange?: (v: number) => void }) {
  const v = value ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange?.(i)} disabled={!onChange}>
          <Star className={cn('h-4 w-4', i <= Math.floor(v) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
        </button>
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
function mesesDesde(d?: Date): number {
  if (!d) return 0;
  const now = new Date();
  const f = new Date(d);
  return Math.max(0, (now.getFullYear() - f.getFullYear()) * 12 + (now.getMonth() - f.getMonth()));
}
function calcularEdad(iso?: string): number | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

/* ── Estado editable del tab Datos ────────────────────────── */
interface DatosForm {
  tipo: TipoContribuyente;
  rut: string;
  nombres: string;
  apellidos: string;
  genero: string;
  estadoCivil: string;
  fechaNacimiento: string;
  profesion: string;
  nivelEstudio: string;
  nacionalidad: string;
  nombreEmpresa: string;
  razonSocial: string;
  giro: string;
  tipoCliente: string;
  canalPreferido: string;
  canalOrigen: string;
  satisfaccionCsat: number;
  interesesCompra: string[];
  noDeseaPromociones: boolean;
  contactoReferidoNombre: string;
}

function clienteToForm(c: ClienteMaestro): DatosForm {
  return {
    tipo: c.tipo,
    rut: c.rut ?? '',
    nombres: c.nombres ?? '',
    apellidos: c.apellidos ?? '',
    genero: c.genero ?? '',
    estadoCivil: c.estadoCivil ?? '',
    fechaNacimiento: c.fechaNacimiento ?? '',
    profesion: c.profesion ?? '',
    nivelEstudio: c.nivelEstudio ?? '',
    nacionalidad: c.nacionalidad ?? '',
    nombreEmpresa: c.nombreEmpresa ?? '',
    razonSocial: c.razonSocial ?? '',
    giro: c.giro ?? '',
    tipoCliente: c.tipoCliente ?? '',
    canalPreferido: c.canalPreferido ?? '',
    canalOrigen: c.canalOrigen ?? '',
    satisfaccionCsat: c.satisfaccionCsat ?? 0,
    interesesCompra: c.interesesCompra ?? [],
    noDeseaPromociones: c.noDeseaPromociones ?? false,
    contactoReferidoNombre: c.contactoReferidoNombre ?? '',
  };
}

function formToPatch(f: DatosForm): Partial<ClienteMaestro> {
  return {
    tipo: f.tipo,
    rut: f.rut || undefined,
    nombres: f.nombres || undefined,
    apellidos: f.apellidos || undefined,
    genero: (f.genero || undefined) as ClienteMaestro['genero'],
    estadoCivil: f.estadoCivil || undefined,
    fechaNacimiento: f.fechaNacimiento || undefined,
    edad: calcularEdad(f.fechaNacimiento),
    profesion: f.profesion || undefined,
    nivelEstudio: f.nivelEstudio || undefined,
    nacionalidad: f.nacionalidad || undefined,
    nombreEmpresa: f.nombreEmpresa || undefined,
    razonSocial: f.razonSocial || undefined,
    giro: f.giro || undefined,
    tipoCliente: f.tipoCliente || undefined,
    canalPreferido: f.canalPreferido || undefined,
    canalOrigen: f.canalOrigen || undefined,
    satisfaccionCsat: f.satisfaccionCsat || undefined,
    interesesCompra: f.interesesCompra,
    noDeseaPromociones: f.noDeseaPromociones,
    contactoReferidoNombre: f.contactoReferidoNombre || undefined,
  };
}

/* ── Tab Datos Personales ─────────────────────────────────── */
function TabDatos({
  cliente, form, setForm,
}: { cliente: ClienteMaestro; form: DatosForm; setForm: React.Dispatch<React.SetStateAction<DatosForm>> }) {
  const [rutError, setRutError] = useState('');
  const set = <K extends keyof DatosForm>(k: K, v: DatosForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  function handleRut(v: string) {
    set('rut', v);
    if (v.length < 3) { setRutError(''); return; }
    setRutError(validarRut(v) ? '' : 'RUT inválido (módulo 11)');
  }
  function handleRutBlur() {
    if (form.rut && !rutError) set('rut', formatearRut(form.rut));
  }
  function toggleInteres(i: string) {
    set('interesesCompra', form.interesesCompra.includes(i)
      ? form.interesesCompra.filter((x) => x !== i)
      : [...form.interesesCompra, i]);
  }

  return (
    <div className="space-y-6">
      {/* Toggle tipo */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo de Contribuyente</Label>
        <div className="flex items-center gap-2">
          {(['persona_natural', 'empresa'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('tipo', t)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                form.tipo === t ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted',
              )}
            >
              <div className={cn('h-2 w-2 rounded-full', form.tipo === t ? 'bg-primary-foreground' : 'bg-muted-foreground')} />
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
          <Input value={cliente.antiguedadMeses ?? mesesDesde(cliente.fechaAlta)} readOnly className="bg-muted/50 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">RUT / Documento</Label>
          <Input value={form.rut} onChange={(e) => handleRut(e.target.value)} onBlur={handleRutBlur} placeholder="Ej: 12.345.678-9" className={cn('font-mono text-sm', rutError && 'border-destructive')} />
          {rutError && <p className="mt-1 text-xs text-destructive">{rutError}</p>}
        </div>
      </div>

      {cliente.nombreReferencial && (
        <div>
          <Label className="text-xs text-muted-foreground">Nombre Referencial (SERVEL)</Label>
          <Input value={cliente.nombreReferencial} readOnly className="bg-amber-50/10 font-mono text-xs text-muted-foreground" />
        </div>
      )}

      {/* Persona natural */}
      {form.tipo === 'persona_natural' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label className="text-xs text-muted-foreground">Nombres</Label><Input value={form.nombres} onChange={(e) => set('nombres', e.target.value)} placeholder="Ingrese nombres" /></div>
          <div><Label className="text-xs text-muted-foreground">Apellidos</Label><Input value={form.apellidos} onChange={(e) => set('apellidos', e.target.value)} placeholder="Ingrese apellidos" /></div>
          <div>
            <Label className="text-xs text-muted-foreground">Género</Label>
            <select className={selectClass} value={form.genero} onChange={(e) => set('genero', e.target.value)}>
              <option value="">Seleccionar...</option><option value="masculino">Masculino</option><option value="femenino">Femenino</option><option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Estado Civil</Label>
            <select className={selectClass} value={form.estadoCivil} onChange={(e) => set('estadoCivil', e.target.value)}>
              <option value="">Seleccionar...</option>{ESTADOS_CIVILES.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div><Label className="text-xs text-muted-foreground">Fecha Nacimiento</Label><Input type="date" value={form.fechaNacimiento} onChange={(e) => set('fechaNacimiento', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground">Edad (calculada)</Label><Input value={calcularEdad(form.fechaNacimiento) ?? '—'} readOnly className="bg-muted/50 text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Profesión / Oficio</Label><Input value={form.profesion} onChange={(e) => set('profesion', e.target.value)} placeholder="Ej: Ingeniero Comercial" /></div>
          <div>
            <Label className="text-xs text-muted-foreground">Nivel de Estudio</Label>
            <select className={selectClass} value={form.nivelEstudio} onChange={(e) => set('nivelEstudio', e.target.value)}>
              <option value="">Seleccionar...</option>{NIVELES_ESTUDIO.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div><Label className="text-xs text-muted-foreground">Nacionalidad</Label><Input value={form.nacionalidad} onChange={(e) => set('nacionalidad', e.target.value)} placeholder="Ej: Chilena" /></div>
        </div>
      )}

      {/* Empresa */}
      {form.tipo === 'empresa' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Nombre Empresa</Label><Input value={form.nombreEmpresa} onChange={(e) => set('nombreEmpresa', e.target.value)} placeholder="Nombre de la empresa" /></div>
          <div><Label className="text-xs text-muted-foreground">Razón Social</Label><Input value={form.razonSocial} onChange={(e) => set('razonSocial', e.target.value)} placeholder="Razón social completa" /></div>
          <div><Label className="text-xs text-muted-foreground">Giro</Label><Input value={form.giro} onChange={(e) => set('giro', e.target.value)} placeholder="Giro comercial" /></div>
        </div>
      )}

      {/* Clasificaciones */}
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><span className="text-base">📊</span> Clasificaciones y Segmentación</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo de Cliente</Label>
            <select className={selectClass} value={form.tipoCliente} onChange={(e) => set('tipoCliente', e.target.value)}>
              <option value="">Sin clasificar</option>{TIPOS_CLIENTE.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><Label className="text-xs text-muted-foreground">Recencia (días)</Label><Input value={cliente.recencia ?? 0} readOnly className="bg-muted/50 font-mono text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Frecuencia (compras)</Label><Input value={cliente.frecuencia ?? 0} readOnly className="bg-muted/50 font-mono text-sm" /></div>
          <div><Label className="text-xs text-muted-foreground">Monto Total</Label><Input value={formatMonto(cliente.montoTotal)} readOnly className="bg-muted/50 font-mono text-sm" /></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div><Label className="text-xs text-muted-foreground">Satisfacción (CSAT)</Label><StarRating value={form.satisfaccionCsat} onChange={(v) => set('satisfaccionCsat', v)} /></div>
          <div>
            <Label className="text-xs text-muted-foreground">Canal Preferido</Label>
            <select className={selectClass} value={form.canalPreferido} onChange={(e) => set('canalPreferido', e.target.value)}>
              <option value="">Seleccionar...</option>{CANALES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Canal de Origen</Label>
            <select className={selectClass} value={form.canalOrigen} onChange={(e) => set('canalOrigen', e.target.value)}>
              <option value="">Seleccionar...</option>{ORIGENES.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <Label className="mb-2 block text-xs text-muted-foreground">Intereses de Compra</Label>
          <div className="flex flex-wrap gap-2">
            {INTERESES.map((i) => (
              <label key={i} className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={form.interesesCompra.includes(i)} onChange={() => toggleInteres(i)} className="h-3.5 w-3.5 rounded border-border accent-primary" />
                <span className="text-sm">{i}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><span className="text-base">🔔</span> Preferencias de Promociones</h3>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={form.noDeseaPromociones} onChange={(e) => set('noDeseaPromociones', e.target.checked)} className="h-4 w-4 accent-primary" />
            <span className="text-sm">No desea recibir promociones</span>
          </label>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><span className="text-base">👥</span> Contacto Referido</h3>
          <div><Label className="text-xs text-muted-foreground">Nombre Referido</Label><Input value={form.contactoReferidoNombre} onChange={(e) => set('contactoReferidoNombre', e.target.value)} placeholder="Nombre completo" /></div>
        </div>
      </div>
    </div>
  );
}

/* ── Tab Direcciones ──────────────────────────────────────── */
function TabDirecciones({ clienteId }: { clienteId: string }) {
  const dirs = useDireccionesByCliente(clienteId);
  const [editando, setEditando] = useState<DireccionCliente | null>(null);
  const [esNuevo, setEsNuevo] = useState(false);

  const comunas = getComunasByRegion(editando?.region || '');

  function nuevaDireccion() {
    setEditando({
      id: '', clienteId, tipo: 'Particular',
      calle: '', numero: '', departamento: '', comuna: '', localidad: '',
      region: '', codigoPostal: '', referencia: '',
      esPreferida: dirs.length === 0, noDeseaPromociones: false, fechaAlta: new Date(),
    });
    setEsNuevo(true);
  }

  async function guardarDireccion() {
    if (!editando) return;
    if (!editando.calle.trim()) { toast.error('Ingrese la calle'); return; }
    if (editando.esPreferida) {
      for (const d of dirs) {
        if (d.id !== editando.id && d.esPreferida) await direccionesCol.update(d.id, { esPreferida: false });
      }
    }
    if (esNuevo) {
      const { id: _omit, ...data } = editando;
      void _omit;
      await direccionesCol.create(data);
      toast.success('Dirección agregada');
    } else {
      await direccionesCol.update(editando.id, editando);
      toast.success('Dirección actualizada');
    }
    setEditando(null);
    setEsNuevo(false);
  }

  async function marcarPreferida(id: string) {
    for (const d of dirs) {
      if (d.esPreferida !== (d.id === id)) await direccionesCol.update(d.id, { esPreferida: d.id === id });
    }
  }

  async function eliminar(id: string) {
    await direccionesCol.remove(id);
    toast.success('Dirección eliminada');
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Datos de Domicilio</h3>
          {!editando && <Button size="sm" onClick={nuevaDireccion}><Plus className="mr-1 h-3.5 w-3.5" /> Nueva dirección</Button>}
        </div>
        {editando ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo Domicilio</Label>
                <select className={selectClass} value={editando.tipo} onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}>
                  {TIPOS_DOMICILIO.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Calle</Label>
                <Input value={editando.calle} onChange={(e) => setEditando({ ...editando, calle: e.target.value })} placeholder="Ej: Av. Libertador Bernardo O'Higgins" />
              </div>
              <div><Label className="text-xs text-muted-foreground">Número</Label><Input value={editando.numero} onChange={(e) => setEditando({ ...editando, numero: e.target.value })} placeholder="1234" /></div>
              <div><Label className="text-xs text-muted-foreground">Dpto / Edificio</Label><Input value={editando.departamento} onChange={(e) => setEditando({ ...editando, departamento: e.target.value })} placeholder="Depto 402" /></div>
              <div>
                <Label className="text-xs text-muted-foreground">Región</Label>
                <select className={selectClass} value={editando.region} onChange={(e) => setEditando({ ...editando, region: e.target.value, comuna: '' })}>
                  <option value="">Seleccionar región...</option>{REGIONES_CHILE.map((r) => <option key={r.codigo} value={r.nombre}>{r.nombre}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Comuna</Label>
                <select className={selectClass} value={editando.comuna} onChange={(e) => setEditando({ ...editando, comuna: e.target.value })} disabled={!editando.region}>
                  <option value="">Seleccionar comuna...</option>{comunas.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><Label className="text-xs text-muted-foreground">Localidad</Label><Input value={editando.localidad} onChange={(e) => setEditando({ ...editando, localidad: e.target.value })} placeholder="Ej: Centro" /></div>
              <div className="sm:col-span-3"><Label className="text-xs text-muted-foreground">Referencia</Label><Input value={editando.referencia} onChange={(e) => setEditando({ ...editando, referencia: e.target.value })} placeholder="Esquina con calle principal, portón verde" /></div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={editando.esPreferida} onChange={(e) => setEditando({ ...editando, esPreferida: e.target.checked })} className="accent-primary" /> Es Domicilio Preferido
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={editando.noDeseaPromociones} onChange={(e) => setEditando({ ...editando, noDeseaPromociones: e.target.checked })} className="accent-primary" /> No desea recibir promociones
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={guardarDireccion}><Save className="mr-1 h-3.5 w-3.5" /> Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => { setEditando(null); setEsNuevo(false); }}><X className="mr-1 h-3.5 w-3.5" /> Cancelar</Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Seleccione una dirección para editar o cree una nueva.</p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
          <span>Registros existentes</span><span>Mostrando {dirs.length} registros</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {['TIPO', 'DIRECCIÓN', 'COMUNA/CIUDAD', 'PREFERIDA', 'ACCIONES'].map((h) => (
                <th key={h} className={cn('px-4 py-2.5 text-xs font-medium text-muted-foreground', h === 'PREFERIDA' ? 'text-center' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dirs.map((d) => (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2.5"><Badge variant="outline" className="text-xs">{d.tipo}</Badge></td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {d.calle} {d.numero}{d.departamento ? `, ${d.departamento}` : ''}
                  {d.referencia && <span className="block text-xs text-muted-foreground/60">{d.referencia}</span>}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{d.comuna}{d.region ? `, ${d.region}` : ''}</td>
                <td className="px-4 py-2.5 text-center">
                  <button onClick={() => marcarPreferida(d.id)}>
                    {d.esPreferida ? <CheckCircle2 className="mx-auto h-4 w-4 text-primary" /> : <Circle className="mx-auto h-4 w-4 text-muted-foreground/40" />}
                  </button>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setEditando(d); setEsNuevo(false); }}><Pencil className="mr-1 h-3 w-3" /> Editar</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => eliminar(d.id)}><Trash2 className="mr-1 h-3 w-3" /> Quitar</Button>
                  </div>
                </td>
              </tr>
            ))}
            {dirs.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">Sin direcciones registradas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Tab Teléfonos ────────────────────────────────────────── */
function TabTelefonos({ clienteId }: { clienteId: string }) {
  const tels = useTelefonosByCliente(clienteId);
  const [editando, setEditando] = useState<TelefonoCliente | null>(null);
  const [esNuevo, setEsNuevo] = useState(false);

  function nuevo() {
    setEditando({
      id: '', clienteId, tipo: 'Celular', telefono: '', formaIngreso: 'manual',
      observacion: '', esPreferido: tels.length === 0, noDeseaPromociones: false, fechaAlta: new Date(),
    });
    setEsNuevo(true);
  }

  async function guardar() {
    if (!editando) return;
    if (!editando.telefono.trim()) { toast.error('Ingrese el teléfono'); return; }
    if (editando.esPreferido) {
      for (const t of tels) if (t.id !== editando.id && t.esPreferido) await telefonosCol.update(t.id, { esPreferido: false });
    }
    if (esNuevo) {
      const { id: _o, ...data } = editando; void _o;
      await telefonosCol.create(data);
      toast.success('Teléfono agregado');
    } else {
      await telefonosCol.update(editando.id, editando);
      toast.success('Teléfono actualizado');
    }
    setEditando(null); setEsNuevo(false);
  }

  async function marcarPreferido(id: string) {
    for (const t of tels) if (t.esPreferido !== (t.id === id)) await telefonosCol.update(t.id, { esPreferido: t.id === id });
  }
  async function eliminar(id: string) { await telefonosCol.remove(id); toast.success('Teléfono eliminado'); }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Phone className="h-4 w-4" /> Teléfonos del Cliente</h3>
          {!editando && <Button size="sm" onClick={nuevo}><Plus className="mr-1 h-3.5 w-3.5" /> Nuevo teléfono</Button>}
        </div>
        {editando ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo Teléfono</Label>
                <select className={selectClass} value={editando.tipo} onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}>
                  {TIPOS_TELEFONO.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><Label className="text-xs text-muted-foreground">Teléfono</Label><Input value={editando.telefono} onChange={(e) => setEditando({ ...editando, telefono: e.target.value })} placeholder="Ej: +56 9 1234 5678" /></div>
              <div>
                <Label className="text-xs text-muted-foreground">Forma Ingreso</Label>
                <select className={selectClass} value={editando.formaIngreso} onChange={(e) => setEditando({ ...editando, formaIngreso: e.target.value as TelefonoCliente['formaIngreso'] })}>
                  <option value="manual">Manual</option><option value="web_form">Web Form</option><option value="api">API</option>
                </select>
              </div>
              <div className="sm:col-span-3"><Label className="text-xs text-muted-foreground">Observación</Label><Input value={editando.observacion} onChange={(e) => setEditando({ ...editando, observacion: e.target.value })} placeholder="Notas adicionales sobre este número..." /></div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={editando.esPreferido} onChange={(e) => setEditando({ ...editando, esPreferido: e.target.checked })} className="accent-primary" /> Es Preferido</label>
              <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={editando.noDeseaPromociones} onChange={(e) => setEditando({ ...editando, noDeseaPromociones: e.target.checked })} className="accent-primary" /> No desea recibir promociones</label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={guardar}><Save className="mr-1 h-3.5 w-3.5" /> Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => { setEditando(null); setEsNuevo(false); }}><X className="mr-1 h-3.5 w-3.5" /> Cancelar</Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Seleccione un teléfono para editar o agregue uno nuevo.</p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">Historial de Teléfonos</span><span className="text-xs text-muted-foreground">{tels.length} registros</span>
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
                <td className="px-3 py-2.5 text-xs capitalize text-muted-foreground">{t.formaIngreso.replace('_', ' ')}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{formatFecha(t.ultimoContacto)}</td>
                <td className="px-3 py-2.5 text-center">
                  <button onClick={() => marcarPreferido(t.id)}>
                    {t.esPreferido ? <CheckCircle2 className="mx-auto h-4 w-4 text-primary" /> : <Circle className="mx-auto h-4 w-4 text-muted-foreground/40" />}
                  </button>
                </td>
                <td className="max-w-[140px] truncate px-3 py-2.5 text-xs text-muted-foreground">{t.observacion || '—'}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => { setEditando(t); setEsNuevo(false); }}>Editar</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-destructive hover:text-destructive" onClick={() => eliminar(t.id)}>Quitar</Button>
                  </div>
                </td>
              </tr>
            ))}
            {tels.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">Sin teléfonos registrados</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Tab Email ────────────────────────────────────────────── */
function TabEmail({ clienteId }: { clienteId: string }) {
  const emails = useEmailsByCliente(clienteId);
  const [editando, setEditando] = useState<EmailCliente | null>(null);
  const [esNuevo, setEsNuevo] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const [emailError, setEmailError] = useState('');

  function nuevo() {
    setEditando({ id: '', clienteId, tipo: 'Personal', email: '', esPreferido: emails.length === 0, publicidad: false, observacion: '', fechaAlta: new Date() });
    setEsNuevo(true); setConfirmacion(''); setEmailError('');
  }
  function validarEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  async function guardar() {
    if (!editando) return;
    if (!validarEmail(editando.email)) { setEmailError('Email inválido'); return; }
    if (editando.email !== confirmacion) { setEmailError('Los emails no coinciden'); return; }
    if (editando.esPreferido) {
      for (const e of emails) if (e.id !== editando.id && e.esPreferido) await emailsCol.update(e.id, { esPreferido: false });
    }
    if (esNuevo) {
      const { id: _o, ...data } = editando; void _o;
      await emailsCol.create(data);
      toast.success('Email agregado');
    } else {
      await emailsCol.update(editando.id, editando);
      toast.success('Email actualizado');
    }
    setEditando(null); setEsNuevo(false);
  }
  async function marcarPreferido(id: string) {
    for (const e of emails) if (e.esPreferido !== (e.id === id)) await emailsCol.update(e.id, { esPreferido: e.id === id });
  }
  async function eliminar(id: string) { await emailsCol.remove(id); toast.success('Email eliminado'); }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4" /> E-mail del Cliente</h3>
          {!editando && <Button size="sm" onClick={nuevo}><Plus className="mr-1 h-3.5 w-3.5" /> Nuevo email</Button>}
        </div>
        {editando ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo E-mail</Label>
                <select className={selectClass} value={editando.tipo} onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}>
                  {TIPOS_EMAIL.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">E-mail</Label>
                <Input type="email" value={editando.email} onChange={(e) => { setEditando({ ...editando, email: e.target.value }); setEmailError(''); }} placeholder="ejemplo@dominio.com" className={emailError ? 'border-destructive' : ''} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Confirmación</Label>
                <Input type="email" value={confirmacion} onChange={(e) => { setConfirmacion(e.target.value); setEmailError(''); }} onPaste={(e) => e.preventDefault()} placeholder="Repita el email" className={emailError ? 'border-destructive' : ''} />
              </div>
              {emailError && <p className="text-xs text-destructive sm:col-span-3">{emailError}</p>}
              <div className="sm:col-span-3"><Label className="text-xs text-muted-foreground">Observación</Label><Input value={editando.observacion} onChange={(e) => setEditando({ ...editando, observacion: e.target.value })} placeholder="Notas adicionales sobre este correo..." /></div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={editando.esPreferido} onChange={(e) => setEditando({ ...editando, esPreferido: e.target.checked })} className="accent-primary" /> Es Preferido</label>
              <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={editando.publicidad} onChange={(e) => setEditando({ ...editando, publicidad: e.target.checked })} className="accent-primary" /> Acepta publicidad</label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={guardar}><Save className="mr-1 h-3.5 w-3.5" /> Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => { setEditando(null); setEsNuevo(false); }}><X className="mr-1 h-3.5 w-3.5" /> Cancelar</Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Seleccione un email para editar o agregue uno nuevo.</p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">Lista de Correos Registrados</span><span className="text-xs text-muted-foreground">{emails.length} registros</span>
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
                    {e.esPreferido ? <CheckCircle2 className="mx-auto h-4 w-4 text-primary" /> : <Circle className="mx-auto h-4 w-4 text-muted-foreground/40" />}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {e.publicidad ? <CheckCircle2 className="mx-auto h-4 w-4 text-primary" /> : <Circle className="mx-auto h-4 w-4 text-muted-foreground/40" />}
                </td>
                <td className="max-w-[140px] truncate px-3 py-2.5 text-xs text-muted-foreground">{e.observacion || '—'}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => { setEditando(e); setEsNuevo(false); setConfirmacion(e.email); }}>Editar</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-destructive hover:text-destructive" onClick={() => eliminar(e.id)}>Quitar</Button>
                  </div>
                </td>
              </tr>
            ))}
            {emails.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">Sin emails registrados</td></tr>}
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

  const cliente = useCliente(id);
  const todosClientes = useClientes();

  const [form, setForm] = useState<DatosForm | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // sincronizar form cuando carga / cambia el cliente
  useEffect(() => {
    if (cliente) setForm(clienteToForm(cliente));
  }, [cliente?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const clientesSugeridos = todosClientes.filter((c) => {
    if (!searchQ) return false;
    return nombreCliente(c).toLowerCase().includes(searchQ.toLowerCase()) || (c.rut ?? '').includes(searchQ);
  }).slice(0, 5);

  async function handleGuardar() {
    if (!cliente || !form) return;
    await clientesCol.update(cliente.id, formToPatch(form));
    toast.success('Cliente guardado correctamente');
  }

  if (!cliente || !form) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button variant="outline" onClick={() => router.push('/crm/clientes')}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Volver a Clientes
        </Button>
      </div>
    );
  }

  const nombreDisplay = nombreCliente(cliente);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b bg-card px-6 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" asChild><Link href="/crm/clientes"><ChevronLeft className="h-4 w-4" /></Link></Button>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Datos del Cliente</p>
            <h2 className="truncate font-semibold leading-tight">{nombreDisplay || 'Sin nombre'}</h2>
          </div>
        </div>

        <div ref={searchRef} className="relative hidden w-56 sm:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-8 w-full rounded-md border border-border bg-muted/50 pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background"
            placeholder="Buscar cliente..."
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
          />
          {searchOpen && clientesSugeridos.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border bg-card shadow-lg">
              {clientesSugeridos.map((c) => (
                <button key={c.id} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted" onClick={() => { router.push(`/crm/clientes/${c.id}`); setSearchOpen(false); setSearchQ(''); }}>
                  <span className="truncate font-medium">{nombreCliente(c)}</span>
                  <span className="ml-auto flex-shrink-0 font-mono text-muted-foreground">{c.rut}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild><Link href="/crm/clientes"><X className="mr-1 h-3.5 w-3.5" /> Cancelar</Link></Button>
          <Button size="sm" onClick={handleGuardar}><Save className="mr-1 h-3.5 w-3.5" /> Guardar</Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-48 flex-shrink-0 flex-col border-r bg-muted/20">
          <div className="space-y-0.5 p-2 pt-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors', activeTab === tab.id ? 'bg-primary font-medium text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                  <Icon className="h-4 w-4 flex-shrink-0" />{tab.label}
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t p-3">
            <Button size="sm" variant="outline" className="w-full text-xs" asChild><Link href="/crm/clientes/nuevo"><Plus className="mr-1 h-3 w-3" /> Nuevo Cliente</Link></Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'datos' && <TabDatos cliente={cliente} form={form} setForm={setForm as React.Dispatch<React.SetStateAction<DatosForm>>} />}
          {activeTab === 'direcciones' && <TabDirecciones clienteId={id} />}
          {activeTab === 'telefonos' && <TabTelefonos clienteId={id} />}
          {activeTab === 'email' && <TabEmail clienteId={id} />}
          {activeTab === 'actividad' && <TabActividadCliente cliente={cliente} />}
        </main>
      </div>
    </div>
  );
}
