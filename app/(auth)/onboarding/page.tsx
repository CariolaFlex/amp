'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Building2, Shield, FileText, BookOpen, Server,
  CheckCircle2, Upload, ChevronRight, ChevronLeft,
  Check, AlertTriangle, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ── Tipos ──────────────────────────────────────────────────────────────────

interface EmpresaState {
  rut: string; razonSocial: string; giro: string;
  direccion: string; comuna: string; ciudad: string;
  actividadEconomica: string;
}
interface PfxState    { file: File | null; uploaded: boolean }
interface CafState    { tipoDte: number; desde: number; hasta: number; nombre: string }
interface ConfigState { tiposDte: { codigo: number; nombre: string; activo: boolean }[]; ambiente: 'certificacion' | 'produccion' }

const PASOS = [
  { id: 1, label: 'Empresa',    icon: Building2,    desc: 'Datos tributarios' },
  { id: 2, label: 'Certificado',icon: Shield,       desc: 'PFX digital' },
  { id: 3, label: 'Tipos DTE',  icon: FileText,     desc: 'Documentos a emitir' },
  { id: 4, label: 'CAFs',       icon: BookOpen,     desc: 'Folios SII' },
  { id: 5, label: 'Ambiente',   icon: Server,       desc: 'Certificación / Producción' },
  { id: 6, label: 'DTE Prueba', icon: CheckCircle2, desc: 'Factura de test' },
];

const TIPOS_DTE_DEFAULT: ConfigState['tiposDte'] = [
  { codigo: 33, nombre: 'Factura Electrónica Afecta', activo: true },
  { codigo: 34, nombre: 'Factura Electrónica Exenta', activo: true },
  { codigo: 39, nombre: 'Boleta Electrónica',         activo: true },
  { codigo: 52, nombre: 'Guía de Despacho Electrónica',activo: false },
  { codigo: 61, nombre: 'Nota de Crédito Electrónica', activo: true },
  { codigo: 56, nombre: 'Nota de Débito Electrónica',  activo: false },
];

const DTE_NOMBRES: Record<number, string> = {
  33: 'Factura Afecta', 34: 'Factura Exenta', 39: 'Boleta', 52: 'Guía Despacho', 61: 'Nota Crédito', 56: 'Nota Débito',
};

// ── Paso 1: Datos empresa ──────────────────────────────────────────────────

function Paso1({ state, onChange }: { state: EmpresaState; onChange: (s: EmpresaState) => void }) {
  const set = (k: keyof EmpresaState, v: string) => onChange({ ...state, [k]: v });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">RUT empresa</label>
          <Input value={state.rut} onChange={e => set('rut', e.target.value)} placeholder="76.123.456-7" className="font-mono" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Razón Social *</label>
          <Input value={state.razonSocial} onChange={e => set('razonSocial', e.target.value)} placeholder="Empresa S.A." />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Giro (según SII)</label>
        <Input value={state.giro} onChange={e => set('giro', e.target.value)} placeholder="Construcción de edificios" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Dirección</label>
          <Input value={state.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Av. Principal 123" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Comuna</label>
          <Input value={state.comuna} onChange={e => set('comuna', e.target.value)} placeholder="Santiago" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Ciudad</label>
          <Input value={state.ciudad} onChange={e => set('ciudad', e.target.value)} placeholder="Santiago" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Código actividad SII</label>
          <Input value={state.actividadEconomica} onChange={e => set('actividadEconomica', e.target.value)} placeholder="41001 — Construcción" />
        </div>
      </div>
    </div>
  );
}

// ── Paso 2: Certificado PFX ────────────────────────────────────────────────

function Paso2({ state, onChange }: { state: PfxState; onChange: (s: PfxState) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <div
        className={cn(
          'rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
          state.uploaded ? 'border-success/50 bg-success/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
        )}
        onClick={() => { if (!state.uploaded) inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pfx"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) onChange({ file: f, uploaded: false });
          }}
        />
        {state.file ? (
          <div className="space-y-2">
            <Shield className="h-8 w-8 text-primary mx-auto" />
            <p className="text-sm font-medium">{state.file.name}</p>
            <p className="text-xs text-muted-foreground">{(state.file.size / 1024).toFixed(1)} KB</p>
            {state.uploaded && <Badge variant="success">Subido correctamente</Badge>}
            {!state.uploaded && (
              <p className="text-xs text-muted-foreground">Clic en <strong>Siguiente</strong> para subirlo</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">Arrastra tu certificado .pfx aquí</p>
            <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
          </div>
        )}
      </div>
      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        El certificado digital PFX es emitido por el SII o una CA autorizada (E-Cert, GlobalSign, etc.). Lo necesitas para firmar electrónicamente cada DTE.
      </div>
    </div>
  );
}

// ── Paso 3: Tipos DTE ──────────────────────────────────────────────────────

function Paso3({ state, onChange }: { state: ConfigState; onChange: (s: ConfigState) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Selecciona los tipos de DTE que emitirás. Puedes cambiar esto después.</p>
      {state.tiposDte.map(t => (
        <div
          key={t.codigo}
          onClick={() => onChange({ ...state, tiposDte: state.tiposDte.map(p => p.codigo === t.codigo ? { ...p, activo: !p.activo } : p) })}
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

// ── Paso 4: CAFs ───────────────────────────────────────────────────────────

function Paso4({ cafs, config }: { cafs: CafState[]; config: ConfigState }) {
  const tiposActivos = config.tiposDte.filter(t => t.activo);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Los CAF los obtienes desde el portal SII. Sube uno por cada tipo de DTE habilitado. El archivo se guarda en el servidor.</p>
      {tiposActivos.map(t => {
        const caf = cafs.find(c => c.tipoDte === t.codigo);
        return (
          <div key={t.codigo} className={cn('flex items-center gap-3 rounded-lg border p-3', caf ? 'border-success/30 bg-success/5' : 'border-border')}>
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold flex-shrink-0', caf ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground')}>
              {t.codigo}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">DTE {t.codigo} — {t.nombre}</p>
              {caf
                ? <p className="text-xs text-success">Folios {caf.desde}–{caf.hasta} ✓</p>
                : <p className="text-xs text-muted-foreground">Sin CAF — sube el XML en el paso "Siguiente"</p>
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Paso 5: Ambiente ───────────────────────────────────────────────────────

function Paso5({ state, onChange }: { state: ConfigState; onChange: (s: ConfigState) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">El ambiente determina si los DTEs se envían al SII real o al servidor de pruebas.</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'certificacion' as const, label: 'Certificación', sub: 'servidor maullin.sii.cl', tag: 'Recomendado para pruebas', color: 'border-warning/50 bg-warning/5' },
          { id: 'produccion' as const,    label: 'Producción',    sub: 'servidor palena.sii.cl',  tag: 'DTEs tributarios reales', color: 'border-destructive/50 bg-destructive/5' },
        ].map(a => (
          <div
            key={a.id}
            onClick={() => onChange({ ...state, ambiente: a.id })}
            className={cn('rounded-lg border-2 p-4 cursor-pointer transition-all', state.ambiente === a.id ? a.color : 'border-border hover:bg-muted/30')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('h-4 w-4 rounded-full border-2 flex-shrink-0', state.ambiente === a.id ? (a.id === 'certificacion' ? 'border-warning bg-warning' : 'border-destructive bg-destructive') : 'border-border')} />
              <span className="font-semibold text-sm">{a.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{a.sub}</p>
            <Badge variant={a.id === 'certificacion' ? 'warning' : 'destructive'} className="mt-2 text-[10px]">{a.tag}</Badge>
          </div>
        ))}
      </div>
      {state.ambiente === 'produccion' && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">En producción los DTEs son documentos tributarios legales con validez ante el SII.</p>
        </div>
      )}
    </div>
  );
}

// ── Paso 6: DTE de prueba ──────────────────────────────────────────────────

function Paso6({ onComplete }: { onComplete: () => void }) {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok'>('idle');
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Emite una factura de prueba para verificar la configuración. La comunicación real con el SII estará disponible con LibreDTE en producción.</p>
      <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Factura de prueba</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span className="text-muted-foreground">Receptor</span><span>76.354.771-K (SII Pruebas)</span>
          <span className="text-muted-foreground">Monto neto</span><span>$ 1.000</span>
          <span className="text-muted-foreground font-medium">Total</span><span className="font-bold">$ 1.190</span>
        </div>
      </div>
      {estado === 'idle' && (
        <Button className="w-full" onClick={() => { setEstado('enviando'); setTimeout(() => { setEstado('ok'); onComplete(); }, 1500); }}>
          Finalizar configuración
        </Button>
      )}
      {estado === 'enviando' && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm">Guardando configuración...</p>
        </div>
      )}
      {estado === 'ok' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center space-y-1">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
            <p className="font-semibold text-success">¡Configuración completada!</p>
            <p className="text-xs text-muted-foreground">Tu empresa está lista para operar</p>
          </div>
          <Link href="/dashboard"><Button className="w-full">Ir al Dashboard →</Button></Link>
        </div>
      )}
    </div>
  );
}

// ── OnboardingPage (orquestador) ──────────────────────────────────────────

export default function OnboardingPage() {
  const [paso, setPaso] = useState(0);
  const [saving, setSaving] = useState(false);
  const cafInputRef = useRef<HTMLInputElement>(null);

  const [empresa, setEmpresa] = useState<EmpresaState>({
    rut: '', razonSocial: '', giro: '', direccion: '', comuna: '', ciudad: '', actividadEconomica: '',
  });
  const [pfx, setPfx] = useState<PfxState>({ file: null, uploaded: false });
  const [config, setConfig] = useState<ConfigState>({ tiposDte: TIPOS_DTE_DEFAULT, ambiente: 'certificacion' });
  const [cafs, setCafs] = useState<CafState[]>([]);

  const progreso = ((paso + 1) / PASOS.length) * 100;

  // ── Guardar al avanzar (paso específico) ─────────────────────────────
  async function handleSiguiente() {
    setSaving(true);
    try {
      if (paso === 0) {
        // Paso 1 → guardar datos empresa
        const res = await fetch('/api/empresa', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(empresa),
        });
        if (!res.ok) { toast.error('Error al guardar datos de empresa'); return; }
        toast.success('Datos guardados');
      }

      if (paso === 1 && pfx.file && !pfx.uploaded) {
        // Paso 2 → subir PFX
        const fd = new FormData();
        fd.append('file', pfx.file);
        const res = await fetch('/api/empresa/pfx', { method: 'POST', body: fd });
        if (!res.ok) { toast.error('Error al subir el certificado'); return; }
        setPfx(p => ({ ...p, uploaded: true }));
        toast.success('Certificado subido');
      }

      if (paso === 4) {
        // Paso 5 → guardar ambiente
        await fetch('/api/empresa', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campo: 'ambiente', valor: config.ambiente }),
        });
      }

      setPaso(p => Math.min(PASOS.length - 1, p + 1));
    } finally {
      setSaving(false);
    }
  }

  async function uploadCaf(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/empresa/caf', { method: 'POST', body: fd });
    const data = await res.json() as { ok?: boolean; tipoDte?: number; desde?: number; hasta?: number; error?: string };
    if (!res.ok || !data.ok) { toast.error(data.error ?? 'Error al procesar CAF'); return; }
    const nombre = DTE_NOMBRES[data.tipoDte!] ?? `DTE ${data.tipoDte}`;
    setCafs(prev => {
      const next = prev.filter(c => c.tipoDte !== data.tipoDte);
      return [...next, { tipoDte: data.tipoDte!, desde: data.desde!, hasta: data.hasta!, nombre }];
    });
    toast.success(`CAF DTE ${data.tipoDte} registrado (folios ${data.desde}–${data.hasta})`);
  }

  async function handleOnboardingCompleto() {
    await fetch('/api/empresa', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campo: 'onboardingCompleto', valor: '1' }),
    });
  }

  const PasoActual = [
    <Paso1 key={0} state={empresa} onChange={setEmpresa} />,
    <Paso2 key={1} state={pfx} onChange={setPfx} />,
    <Paso3 key={2} state={config} onChange={setConfig} />,
    <div key={3}>
      <Paso4 cafs={cafs} config={config} />
      {/* Upload CAF inline en este paso */}
      <div className="mt-4 space-y-2">
        <input ref={cafInputRef} type="file" accept=".xml" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadCaf(f); }} />
        <Button variant="outline" size="sm" className="h-8 text-xs w-full" onClick={() => cafInputRef.current?.click()}>
          <Upload className="mr-1.5 h-3.5 w-3.5" />Subir CAF XML
        </Button>
      </div>
    </div>,
    <Paso5 key={4} state={config} onChange={setConfig} />,
    <Paso6 key={5} onComplete={handleOnboardingCompleto} />,
  ];

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
                onClick={() => i < paso && setPaso(i)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-xs whitespace-nowrap transition-colors flex-shrink-0',
                  i === paso ? 'bg-primary text-primary-foreground'
                    : i < paso ? 'bg-success/15 text-success cursor-pointer hover:bg-success/25'
                    : 'bg-muted text-muted-foreground cursor-default'
                )}
              >
                {i < paso ? <Check className="h-3.5 w-3.5" /> : <p.icon className="h-3.5 w-3.5" />}
                {p.label}
              </button>
              {i < PASOS.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
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
          <CardContent>{PasoActual[paso]}</CardContent>
        </Card>

        {/* Nav */}
        {paso < PASOS.length - 1 && (
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setPaso(p => Math.max(0, p - 1))} disabled={paso === 0} className="h-9">
              <ChevronLeft className="h-4 w-4 mr-1" />Anterior
            </Button>
            <span className="text-xs text-muted-foreground">{paso + 1} / {PASOS.length}</span>
            <Button onClick={handleSiguiente} disabled={saving} className="h-9">
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Siguiente<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
