'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatRut } from '@/lib/utils/rut';
import {
  Building2, Shield, FileText, BookOpen, Server,
  CheckCircle2, Upload, ChevronRight, ChevronLeft,
  Check, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

const PASOS = [
  { id: 1, label: 'Empresa', icon: Building2, desc: 'Datos tributarios' },
  { id: 2, label: 'Certificado', icon: Shield, desc: 'PFX digital' },
  { id: 3, label: 'Tipos DTE', icon: FileText, desc: 'Documentos a emitir' },
  { id: 4, label: 'CAFs', icon: BookOpen, desc: 'Folios SII' },
  { id: 5, label: 'Ambiente', icon: Server, desc: 'Certificación / Producción' },
  { id: 6, label: 'DTE Prueba', icon: CheckCircle2, desc: 'Factura de test' },
];

const TIPOS_DTE = [
  { codigo: 33, nombre: 'Factura Electrónica Afecta', activo: true },
  { codigo: 34, nombre: 'Factura Electrónica Exenta', activo: true },
  { codigo: 39, nombre: 'Boleta Electrónica', activo: true },
  { codigo: 52, nombre: 'Guía de Despacho Electrónica', activo: false },
  { codigo: 61, nombre: 'Nota de Crédito Electrónica', activo: true },
  { codigo: 56, nombre: 'Nota de Débito Electrónica', activo: false },
];

function Paso1() {
  const [rut, setRut] = useState('76.123.456-7');
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">RUT de la empresa</label>
        <Input value={rut} onChange={e => setRut(formatRut(e.target.value))} placeholder="76.123.456-7" className="font-mono" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Razón social</label>
        <Input defaultValue="Constructora Los Andes SpA" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Giro (según SII)</label>
        <Input defaultValue="Construcción de edificios y obras de ingeniería" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Dirección</label>
          <Input defaultValue="Av. Balmaceda 1234, Of. 301" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Comuna</label>
          <Input defaultValue="La Serena" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Actividad económica (código SII)</label>
        <Input defaultValue="41001 — Construcción de edificios residenciales" />
      </div>
    </div>
  );
}

function Paso2() {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div className="space-y-4">
      <div className={cn(
        'rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
        uploaded ? 'border-success/50 bg-success/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
      )} onClick={() => setUploaded(true)}>
        {uploaded ? (
          <div className="space-y-2">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
            <p className="text-sm font-medium">certificado_empresa.pfx</p>
            <p className="text-xs text-muted-foreground">Válido hasta 31/12/2027</p>
            <Badge variant="success">Certificado válido</Badge>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">Arrastra tu certificado .pfx aquí</p>
            <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
          </div>
        )}
      </div>
      {uploaded && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Contraseña del certificado</label>
          <Input type="password" placeholder="••••••••" />
        </div>
      )}
      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        El certificado digital PFX es emitido por el SII o una CA autorizada (E-Cert, GlobalSign, etc.). Lo necesitas para firmar electrónicamente cada DTE.
      </div>
    </div>
  );
}

function Paso3() {
  const [tipos, setTipos] = useState(TIPOS_DTE);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Selecciona los tipos de DTE que emitirás. Puedes cambiar esto después.</p>
      {tipos.map(t => (
        <div
          key={t.codigo}
          onClick={() => setTipos(prev => prev.map(p => p.codigo === t.codigo ? { ...p, activo: !p.activo } : p))}
          className={cn(
            'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
            t.activo ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-muted/30'
          )}
        >
          <div className={cn('flex h-5 w-5 items-center justify-center rounded border-2 flex-shrink-0', t.activo ? 'border-primary bg-primary' : 'border-border')}>
            {t.activo && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium">DTE {t.codigo}</span>
            <span className="text-xs text-muted-foreground ml-2">— {t.nombre}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Paso4() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Los CAF (Código de Autorización de Folios) los obtienes desde el portal SII. Sube uno por cada tipo de DTE habilitado.</p>
      {[
        { tipo: 33, nombre: 'Factura Afecta', cargado: true, folios: '1001-2000' },
        { tipo: 34, nombre: 'Factura Exenta', cargado: false },
        { tipo: 39, nombre: 'Boleta', cargado: true, folios: '1001-5000' },
        { tipo: 61, nombre: 'Nota de Crédito', cargado: false },
      ].map(caf => (
        <div key={caf.tipo} className={cn('flex items-center gap-3 rounded-lg border p-3', caf.cargado ? 'border-success/30' : 'border-border')}>
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold flex-shrink-0', caf.cargado ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground')}>
            {caf.tipo}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">DTE {caf.tipo} — {caf.nombre}</p>
            {caf.cargado
              ? <p className="text-xs text-success">Folios {caf.folios} ✓</p>
              : <p className="text-xs text-muted-foreground">Sin CAF cargado</p>
            }
          </div>
          <Button variant={caf.cargado ? 'outline' : 'default'} size="sm" className="h-7 text-xs flex-shrink-0">
            {caf.cargado ? 'Reemplazar' : 'Cargar CAF'}
          </Button>
        </div>
      ))}
    </div>
  );
}

function Paso5() {
  const [ambiente, setAmbiente] = useState<'certificacion' | 'produccion'>('certificacion');
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">El ambiente determina si los DTEs se envían al SII real o al servidor de pruebas (maullin).</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'certificacion' as const, label: 'Certificación', sub: 'servidor maullin.sii.cl', tag: 'Recomendado para pruebas', color: 'border-warning/50 bg-warning/5' },
          { id: 'produccion' as const, label: 'Producción', sub: 'servidor palena.sii.cl', tag: 'DTEs legales reales', color: 'border-destructive/50 bg-destructive/5' },
        ].map(a => (
          <div
            key={a.id}
            onClick={() => setAmbiente(a.id)}
            className={cn('rounded-lg border-2 p-4 cursor-pointer transition-all', ambiente === a.id ? a.color + ' border-opacity-100' : 'border-border hover:bg-muted/30')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('h-4 w-4 rounded-full border-2 flex-shrink-0', ambiente === a.id ? (a.id === 'certificacion' ? 'border-warning bg-warning' : 'border-destructive bg-destructive') : 'border-border')} />
              <span className="font-semibold text-sm">{a.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{a.sub}</p>
            <Badge variant={a.id === 'certificacion' ? 'warning' : 'destructive'} className="mt-2 text-[10px]">{a.tag}</Badge>
          </div>
        ))}
      </div>
      {ambiente === 'produccion' && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">En producción los DTEs emitidos son documentos tributarios legales con validez ante el SII. No puedes anular una factura sin emitir una nota de crédito.</p>
        </div>
      )}
    </div>
  );
}

function Paso6() {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle');
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Emite una factura de prueba al SII para verificar que tu configuración es correcta.</p>
      <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Factura de prueba</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span className="text-muted-foreground">Emisor</span>
          <span>Constructora Los Andes SpA</span>
          <span className="text-muted-foreground">Receptor</span>
          <span>76.354.771-K (SII Pruebas)</span>
          <span className="text-muted-foreground">Monto neto</span>
          <span>$ 1.000</span>
          <span className="text-muted-foreground">IVA 19%</span>
          <span>$ 190</span>
          <span className="text-muted-foreground font-medium">Total</span>
          <span className="font-bold">$ 1.190</span>
        </div>
      </div>

      {estado === 'idle' && (
        <Button className="w-full" onClick={() => { setEstado('enviando'); setTimeout(() => setEstado('ok'), 1800); }}>
          Emitir factura de prueba
        </Button>
      )}

      {estado === 'enviando' && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm">Enviando al SII (maullin)...</p>
        </div>
      )}

      {estado === 'ok' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center space-y-1">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
            <p className="font-semibold text-success">DTE aceptado por SII</p>
            <p className="text-xs text-muted-foreground">Folio #1 · Track ID: 12345678</p>
          </div>
          <Link href="/dashboard">
            <Button className="w-full">Ir al Dashboard →</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

const COMPONENTES = [Paso1, Paso2, Paso3, Paso4, Paso5, Paso6];

export default function OnboardingPage() {
  const [paso, setPaso] = useState(0);
  const progreso = ((paso + 1) / PASOS.length) * 100;
  const PasoActual = COMPONENTES[paso];

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 pt-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Ampuero<span className="text-primary">ERP</span></span>
          </div>
          <h1 className="text-xl font-bold">Configuración inicial</h1>
          <p className="text-sm text-muted-foreground">Configura tu empresa y conéctala al SII</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {PASOS.map((p, i) => (
            <React.Fragment key={p.id}>
              <button
                onClick={() => i <= paso && setPaso(i)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-xs whitespace-nowrap transition-colors flex-shrink-0',
                  i === paso ? 'bg-primary text-primary-foreground'
                  : i < paso ? 'bg-success/15 text-success cursor-pointer hover:bg-success/25'
                  : 'bg-muted text-muted-foreground cursor-default'
                )}
              >
                {i < paso
                  ? <Check className="h-3.5 w-3.5" />
                  : <p.icon className="h-3.5 w-3.5" />
                }
                {p.label}
              </button>
              {i < PASOS.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        <Progress value={progreso} className="h-1.5" />

        {/* Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {React.createElement(PASOS[paso].icon, { className: 'h-5 w-5 text-primary' })}
              <div>
                <h2 className="font-semibold">Paso {paso + 1}: {PASOS[paso].label}</h2>
                <p className="text-xs text-muted-foreground">{PASOS[paso].desc}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PasoActual />
          </CardContent>
        </Card>

        {/* Nav */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setPaso(p => Math.max(0, p - 1))} disabled={paso === 0} className="h-9">
            <ChevronLeft className="h-4 w-4 mr-1" />Anterior
          </Button>
          <span className="text-xs text-muted-foreground">{paso + 1} / {PASOS.length}</span>
          {paso < PASOS.length - 1 && (
            <Button onClick={() => setPaso(p => Math.min(PASOS.length - 1, p + 1))} className="h-9">
              Siguiente<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
