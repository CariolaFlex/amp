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

const ESTADOS_CIVILES = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente civil'];
const NIVELES_ESTUDIO = ['Básica', 'Media', 'Técnico', 'Universitario', 'Postgrado'];

export default function NuevoClientePage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<'persona_natural' | 'empresa'>('persona_natural');
  const [rut, setRut] = useState('');
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

  function handleGuardar() {
    if (rut && rutError) {
      toast.error('Corrija el RUT antes de guardar');
      return;
    }
    toast.success('Cliente creado correctamente');
    // Con backend real: POST /api/clientes → redirect al ID creado
    router.push('/crm/clientes');
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
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
          <Button size="sm" onClick={handleGuardar}>
            <Save className="mr-1 h-3.5 w-3.5" /> Guardar
          </Button>
        </div>
      </div>

      {/* Formulario */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        {/* Tipo contribuyente */}
        <div>
          <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tipo de Contribuyente
          </Label>
          <div className="flex gap-3">
            <button
              onClick={() => setTipo('persona_natural')}
              className={cn(
                'flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors flex-1 justify-center',
                tipo === 'persona_natural'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
            >
              <User className="h-4 w-4" /> Persona Natural
            </button>
            <button
              onClick={() => setTipo('empresa')}
              className={cn(
                'flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors flex-1 justify-center',
                tipo === 'empresa'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted'
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
            value={rut}
            onChange={(e) => handleRut(e.target.value)}
            onBlur={handleRutBlur}
            placeholder="Ej: 12.345.678-9"
            className={cn('font-mono mt-1', rutError && 'border-destructive')}
          />
          {rutError && <p className="mt-1 text-xs text-destructive">{rutError}</p>}
        </div>

        {/* Campos persona natural */}
        {tipo === 'persona_natural' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Nombres *</Label>
              <Input placeholder="Ingrese nombres" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Apellidos *</Label>
              <Input placeholder="Ingrese apellidos" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Género</Label>
              <select className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                <option value="">Seleccionar...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Estado Civil</Label>
              <select className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                <option value="">Seleccionar...</option>
                {ESTADOS_CIVILES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fecha Nacimiento</Label>
              <Input type="date" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Profesión / Oficio</Label>
              <Input placeholder="Ej: Ingeniero" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Nivel de Estudio</Label>
              <select className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                <option value="">Seleccionar...</option>
                {NIVELES_ESTUDIO.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Nacionalidad</Label>
              <Input placeholder="Ej: Chilena" className="mt-1" />
            </div>
          </div>
        )}

        {/* Campos empresa */}
        {tipo === 'empresa' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Nombre Empresa *</Label>
              <Input placeholder="Nombre de la empresa" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Razón Social</Label>
              <Input placeholder="Razón social completa" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Giro</Label>
              <Input placeholder="Giro comercial" className="mt-1" />
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
