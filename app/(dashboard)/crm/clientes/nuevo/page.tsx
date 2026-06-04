'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronLeft, Save, X, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { validarRut, formatearRut } from '@/lib/validators/rut';
import { useCrearCliente } from '@/lib/data/clientes';
import type { ClienteMaestro, TipoContribuyente } from '@/types';

const ESTADOS_CIVILES = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente civil'];
const NIVELES_ESTUDIO = ['Básica', 'Media', 'Técnico', 'Universitario', 'Postgrado'];

const selectClass =
  'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm';

interface FormState {
  rut: string;
  // PN
  nombres: string;
  apellidos: string;
  genero: string;
  estadoCivil: string;
  fechaNacimiento: string;
  profesion: string;
  nivelEstudio: string;
  nacionalidad: string;
  // Empresa
  nombreEmpresa: string;
  razonSocial: string;
  giro: string;
}

const EMPTY: FormState = {
  rut: '', nombres: '', apellidos: '', genero: '', estadoCivil: '',
  fechaNacimiento: '', profesion: '', nivelEstudio: '', nacionalidad: '',
  nombreEmpresa: '', razonSocial: '', giro: '',
};

function calcularEdad(iso: string): number | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export default function NuevoClientePage() {
  const router = useRouter();
  const crearCliente = useCrearCliente();
  const [tipo, setTipo] = useState<TipoContribuyente>('persona_natural');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [rutError, setRutError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleRut(v: string) {
    set('rut', v);
    if (v.length < 3) { setRutError(''); return; }
    setRutError(validarRut(v) ? '' : 'RUT inválido (módulo 11)');
  }

  function handleRutBlur() {
    if (form.rut && !rutError) set('rut', formatearRut(form.rut));
  }

  async function handleGuardar() {
    if (form.rut && rutError) {
      toast.error('Corrija el RUT antes de guardar');
      return;
    }
    if (tipo === 'persona_natural' && !form.nombres.trim() && !form.apellidos.trim()) {
      toast.error('Ingrese al menos nombres o apellidos');
      return;
    }
    if (tipo === 'empresa') {
      if (!form.nombreEmpresa.trim()) { toast.error('Ingrese el nombre de la empresa'); return; }
      if (!form.rut.trim() || rutError) { toast.error('El RUT es obligatorio para empresas'); return; }
    }

    setSaving(true);
    const result = await crearCliente.mutateAsync({
      tipo,
      rut: form.rut || undefined,
      idCliente: String(Date.now()),
      fechaAlta: new Date(),
      noDeseaPromociones: false,
      ...(tipo === 'persona_natural'
        ? {
            nombres: form.nombres.trim() || undefined,
            apellidos: form.apellidos.trim() || undefined,
            genero: (form.genero || undefined) as ClienteMaestro['genero'],
            estadoCivil: form.estadoCivil || undefined,
            fechaNacimiento: form.fechaNacimiento || undefined,
            edad: calcularEdad(form.fechaNacimiento),
            profesion: form.profesion.trim() || undefined,
            nivelEstudio: form.nivelEstudio || undefined,
            nacionalidad: form.nacionalidad.trim() || undefined,
          }
        : {
            nombreEmpresa: form.nombreEmpresa.trim(),
            razonSocial: form.razonSocial.trim() || form.nombreEmpresa.trim(),
            giro: form.giro.trim() || undefined,
          }),
    });
    toast.success('Cliente creado correctamente');
    router.push(`/crm/clientes/${result.id}`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/crm/clientes"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <p className="text-xs text-muted-foreground">Maestro Clientes</p>
            <h1 className="text-xl font-bold">Nuevo Cliente</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/crm/clientes"><X className="mr-1 h-3.5 w-3.5" /> Cancelar</Link>
          </Button>
          <Button size="sm" onClick={handleGuardar} disabled={saving}>
            <Save className="mr-1 h-3.5 w-3.5" /> {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-6 rounded-lg border bg-card p-6">
        {/* Tipo contribuyente */}
        <div>
          <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tipo de Contribuyente
          </Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTipo('persona_natural')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors',
                tipo === 'persona_natural' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              <User className="h-4 w-4" /> Persona Natural
            </button>
            <button
              type="button"
              onClick={() => setTipo('empresa')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors',
                tipo === 'empresa' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              <Building2 className="h-4 w-4" /> Empresa
            </button>
          </div>
        </div>

        {/* RUT */}
        <div>
          <Label className="text-xs text-muted-foreground">
            RUT / Documento {tipo === 'persona_natural' ? '(opcional en prospectos)' : '(requerido)'}
          </Label>
          <Input
            value={form.rut}
            onChange={(e) => handleRut(e.target.value)}
            onBlur={handleRutBlur}
            placeholder="Ej: 12.345.678-9"
            className={cn('mt-1 font-mono', rutError && 'border-destructive')}
          />
          {rutError && <p className="mt-1 text-xs text-destructive">{rutError}</p>}
        </div>

        {/* Persona natural */}
        {tipo === 'persona_natural' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Nombres *</Label>
              <Input value={form.nombres} onChange={(e) => set('nombres', e.target.value)} placeholder="Ingrese nombres" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Apellidos *</Label>
              <Input value={form.apellidos} onChange={(e) => set('apellidos', e.target.value)} placeholder="Ingrese apellidos" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Género</Label>
              <select value={form.genero} onChange={(e) => set('genero', e.target.value)} className={selectClass}>
                <option value="">Seleccionar...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Estado Civil</Label>
              <select value={form.estadoCivil} onChange={(e) => set('estadoCivil', e.target.value)} className={selectClass}>
                <option value="">Seleccionar...</option>
                {ESTADOS_CIVILES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fecha Nacimiento</Label>
              <Input type="date" value={form.fechaNacimiento} onChange={(e) => set('fechaNacimiento', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Profesión / Oficio</Label>
              <Input value={form.profesion} onChange={(e) => set('profesion', e.target.value)} placeholder="Ej: Ingeniero" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Nivel de Estudio</Label>
              <select value={form.nivelEstudio} onChange={(e) => set('nivelEstudio', e.target.value)} className={selectClass}>
                <option value="">Seleccionar...</option>
                {NIVELES_ESTUDIO.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Nacionalidad</Label>
              <Input value={form.nacionalidad} onChange={(e) => set('nacionalidad', e.target.value)} placeholder="Ej: Chilena" className="mt-1" />
            </div>
          </div>
        )}

        {/* Empresa */}
        {tipo === 'empresa' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Nombre Empresa *</Label>
              <Input value={form.nombreEmpresa} onChange={(e) => set('nombreEmpresa', e.target.value)} placeholder="Nombre de la empresa" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Razón Social</Label>
              <Input value={form.razonSocial} onChange={(e) => set('razonSocial', e.target.value)} placeholder="Razón social completa" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Giro</Label>
              <Input value={form.giro} onChange={(e) => set('giro', e.target.value)} placeholder="Giro comercial" className="mt-1" />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          * Después de crear el cliente podrá agregar direcciones, teléfonos y emails desde la ficha completa.
        </p>
      </div>
    </div>
  );
}
