'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCLP } from '@/lib/utils/clp';
import { Upload, Loader2, CheckCircle2, AlertCircle, X, FileSpreadsheet } from 'lucide-react';
import { parsearNominaCSV } from '@/lib/utils/csv-empleados';
import type { EmpleadoCSV } from '@/lib/utils/csv-empleados';
import { useQueryClient } from '@tanstack/react-query';

interface Props { open: boolean; onOpenChange: (v: boolean) => void }

type Step = 'upload' | 'preview' | 'result';
interface ResultData { importados: number; saltados: number; errores: string[] }

const CONTRATO_LABEL: Record<string, string> = {
  indefinido: 'Indefinido', plazo_fijo: 'Plazo Fijo', obra_faena: 'Obra/Faena',
};

export function ImportNominaDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [dragging, setDragging] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [empleados, setEmpleados] = useState<EmpleadoCSV[]>([]);
  const [erroresParse, setErroresParse] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  function reset() {
    setStep('upload'); setArchivo(null); setEmpleados([]);
    setErroresParse([]); setResult(null);
  }

  function handleFile(f: File) {
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.txt')) return;
    setArchivo(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { empleados: emps, errores } = parsearNominaCSV(text);
      setEmpleados(emps);
      setErroresParse(errores);
      setStep('preview');
    };
    reader.readAsText(f, 'utf-8');
  }

  async function handleImport() {
    if (!archivo) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', archivo);
      const res = await fetch('/api/empleados/import', { method: 'POST', body: fd });
      const data = await res.json() as ResultData & { error?: string };
      if (!res.ok && !data.importados) {
        setResult({ importados: 0, saltados: 0, errores: [data.error ?? 'Error desconocido'] });
      } else {
        setResult(data);
        await qc.invalidateQueries({ queryKey: ['empleados'] });
      }
      setStep('result');
    } finally {
      setImporting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => { reset(); onOpenChange(false); }} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative flex w-full max-w-2xl flex-col rounded-xl border bg-card shadow-2xl" style={{ maxHeight: '85vh' }}>

          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Importar nómina</h2>
              <p className="text-xs text-muted-foreground">Compatible con Buk, Talana y CSV genérico</p>
            </div>
            <button onClick={() => { reset(); onOpenChange(false); }} className="rounded-md p-1.5 hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Step: upload */}
            {step === 'upload' && (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors',
                  dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40',
                )}
              >
                <input ref={inputRef} type="file" accept=".csv,.txt" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Arrastra el CSV de nómina aquí</p>
                  <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar — .csv o .txt</p>
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span className="rounded-full border px-2 py-0.5">Buk</span>
                  <span className="rounded-full border px-2 py-0.5">Talana</span>
                  <span className="rounded-full border px-2 py-0.5">Genérico</span>
                </div>
              </div>
            )}

            {/* Step: preview */}
            {step === 'preview' && (
              <>
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{archivo?.name}</p>
                    <p className="text-xs text-muted-foreground">{empleados.length} empleados detectados{erroresParse.length > 0 ? ` · ${erroresParse.length} filas con error` : ''}</p>
                  </div>
                  <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">Cambiar</button>
                </div>

                {erroresParse.length > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Filas ignoradas ({erroresParse.length})</p>
                    {erroresParse.slice(0, 3).map((e, i) => <p key={i} className="text-xs text-muted-foreground">{e}</p>)}
                    {erroresParse.length > 3 && <p className="text-xs text-muted-foreground">…y {erroresParse.length - 3} más</p>}
                  </div>
                )}

                {empleados.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-muted/30 px-3 py-2 text-xs font-medium border-b">
                      Previsualización — {empleados.length} empleados a importar
                    </div>
                    <div className="max-h-52 overflow-y-auto divide-y">
                      {empleados.map((e, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{e.nombre}</p>
                            <p className="text-muted-foreground font-mono">{e.rut} · {e.cargo || '—'} · {CONTRATO_LABEL[e.contrato]}</p>
                          </div>
                          <span className="ml-2 text-muted-foreground">{e.sueldoBase > 0 ? formatCLP(e.sueldoBase) : '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    No se detectaron empleados válidos. Verifica que el CSV tenga columnas RUT y Nombre.
                  </div>
                )}
              </>
            )}

            {/* Step: result */}
            {step === 'result' && result && (
              <div className="space-y-3">
                <div className={cn(
                  'rounded-lg border p-5 text-center space-y-2',
                  result.importados > 0 ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5',
                )}>
                  {result.importados > 0
                    ? <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
                    : <AlertCircle className="h-8 w-8 text-destructive mx-auto" />}
                  <p className="font-semibold">
                    {result.importados > 0 ? `${result.importados} empleado${result.importados > 1 ? 's' : ''} importados` : 'Sin importaciones'}
                  </p>
                  {result.saltados > 0 && <p className="text-xs text-muted-foreground">{result.saltados} omitidos (duplicados u errores)</p>}
                </div>
                {result.errores.length > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
                    {result.errores.slice(0, 5).map((e, i) => <p key={i} className="text-xs text-muted-foreground">{e}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
            {step === 'preview' && (
              <>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={reset}>Cancelar</Button>
                <Button size="sm" className="h-8 text-xs" onClick={handleImport}
                  disabled={importing || empleados.length === 0}>
                  {importing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                  Importar {empleados.length} empleados
                </Button>
              </>
            )}
            {step === 'result' && (
              <Button size="sm" className="h-8 text-xs" onClick={() => { reset(); onOpenChange(false); }}>
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
