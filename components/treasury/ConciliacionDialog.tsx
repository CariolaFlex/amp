'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCLP } from '@/lib/utils/clp';
import { formatDate } from '@/lib/utils/dates';
import {
  Upload, CheckCircle2, AlertCircle, MinusCircle, Loader2,
  FileText, X, Download,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { ResultadoConciliacion } from '@/app/api/bancos/[id]/conciliar/route';
import type { CuentaBancaria } from '@/types';

interface Props {
  cuenta: CuentaBancaria;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Tab = 'conciliados' | 'importar' | 'faltantes';

export function ConciliacionDialog({ cuenta, open, onOpenChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoConciliacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('conciliados');
  const [importados, setImportados] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const reset = () => {
    setArchivo(null);
    setResultado(null);
    setError(null);
    setTab('conciliados');
    setImportados(false);
  };

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.txt')) {
      setError('Solo se aceptan archivos .csv o .txt');
      return;
    }
    setArchivo(f);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const analizar = async () => {
    if (!archivo) return;
    setCargando(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', archivo);
      const res = await fetch(`/api/bancos/${cuenta.id}/conciliar`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError((data as { error: string }).error); return; }
      setResultado(data as ResultadoConciliacion);
      setTab('conciliados');
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const importarNuevos = async () => {
    if (!resultado?.soloEnCartola.length) return;
    setImportando(true);
    try {
      await Promise.all(
        resultado.soloEnCartola.map((l) =>
          fetch(`/api/bancos/${cuenta.id}/movimientos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fecha: l.fecha,
              descripcion: l.descripcion,
              monto: l.monto,
            }),
          }),
        ),
      );
      await qc.invalidateQueries({ queryKey: ['bancos'] });
      await qc.invalidateQueries({ queryKey: ['bancos-movimientos'] });
      setImportados(true);
    } catch {
      setError('Error al importar movimientos');
    } finally {
      setImportando(false);
    }
  };

  if (!open) return null;

  const tabs: { key: Tab; label: string; count: number; color: string }[] = [
    { key: 'conciliados', label: 'Conciliados', count: resultado?.conciliados.length ?? 0, color: 'text-green-600 dark:text-green-400' },
    { key: 'importar',    label: 'Solo en cartola', count: resultado?.soloEnCartola.length ?? 0, color: 'text-amber-600 dark:text-amber-400' },
    { key: 'faltantes',  label: 'Solo en sistema', count: resultado?.soloEnDB.length ?? 0, color: 'text-blue-600 dark:text-blue-400' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => { reset(); onOpenChange(false); }} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative flex w-full max-w-2xl flex-col rounded-xl border bg-card shadow-2xl" style={{ maxHeight: '90vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Conciliación bancaria</h2>
              <p className="text-xs text-muted-foreground">{cuenta.banco} · {cuenta.numero}</p>
            </div>
            <button onClick={() => { reset(); onOpenChange(false); }} className="rounded-md p-1.5 hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Upload zone */}
            {!resultado && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors',
                  dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40',
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {archivo ? (
                  <>
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <p className="text-sm font-medium">{archivo.name}</p>
                      <p className="text-xs text-muted-foreground">{(archivo.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Clic para cambiar</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">Arrastra la cartola aquí</p>
                      <p className="text-xs text-muted-foreground">o haz clic para seleccionar — .csv o .txt</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Compatible con Santander · BCI · BancoEstado · Scotiabank</p>
                  </>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Resultado */}
            {resultado && (
              <div className="space-y-3">
                {/* Resumen */}
                <div className="grid grid-cols-3 gap-2">
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-colors',
                        tab === t.key ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/60',
                      )}
                    >
                      <p className={cn('text-lg font-bold', t.color)}>{t.count}</p>
                      <p className="text-xs text-muted-foreground">{t.label}</p>
                    </button>
                  ))}
                </div>

                {/* Tabla */}
                <div className="rounded-lg border overflow-hidden">
                  <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
                    {tab === 'conciliados'  && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                    {tab === 'importar'     && <AlertCircle  className="h-3.5 w-3.5 text-amber-500" />}
                    {tab === 'faltantes'    && <MinusCircle  className="h-3.5 w-3.5 text-blue-500"  />}
                    <span className="text-xs font-medium">
                      {tab === 'conciliados' && 'Movimientos que coinciden fecha + monto'}
                      {tab === 'importar'    && 'En cartola pero NO en el sistema — se pueden importar'}
                      {tab === 'faltantes'   && 'En el sistema pero NO en la cartola'}
                    </span>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {tab === 'conciliados' && (
                      resultado.conciliados.length === 0 ? (
                        <p className="px-3 py-4 text-center text-xs text-muted-foreground">Sin coincidencias exactas</p>
                      ) : resultado.conciliados.map(({ cartola, movimiento }, i) => (
                        <div key={i} className="flex items-center justify-between border-b px-3 py-2 last:border-0 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{cartola.descripcion}</p>
                            <p className="text-muted-foreground">{formatDate(cartola.fecha)} · {movimiento.descripcion}</p>
                          </div>
                          <span className={cn('ml-2 font-mono font-semibold', cartola.monto >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive')}>
                            {formatCLP(cartola.monto)}
                          </span>
                        </div>
                      ))
                    )}
                    {tab === 'importar' && (
                      resultado.soloEnCartola.length === 0 ? (
                        <p className="px-3 py-4 text-center text-xs text-muted-foreground">Todos los movimientos de la cartola están registrados</p>
                      ) : resultado.soloEnCartola.map((l, i) => (
                        <div key={i} className="flex items-center justify-between border-b px-3 py-2 last:border-0 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="truncate">{l.descripcion}</p>
                            <p className="text-muted-foreground">{formatDate(l.fecha)}</p>
                          </div>
                          <span className={cn('ml-2 font-mono font-semibold', l.monto >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive')}>
                            {formatCLP(l.monto)}
                          </span>
                        </div>
                      ))
                    )}
                    {tab === 'faltantes' && (
                      resultado.soloEnDB.length === 0 ? (
                        <p className="px-3 py-4 text-center text-xs text-muted-foreground">Todos los movimientos del sistema están en la cartola</p>
                      ) : resultado.soloEnDB.map((m, i) => (
                        <div key={i} className="flex items-center justify-between border-b px-3 py-2 last:border-0 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="truncate">{m.descripcion}</p>
                            <p className="text-muted-foreground">{formatDate(m.fecha)}</p>
                          </div>
                          <span className={cn('ml-2 font-mono font-semibold', m.monto >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive')}>
                            {formatCLP(m.monto)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-5 py-3">
            <div>
              {resultado && (
                <p className="text-xs text-muted-foreground">
                  {resultado.totalLineas} líneas procesadas de la cartola
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {resultado ? (
                <>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={reset}>
                    Subir otra cartola
                  </Button>
                  {!importados && resultado.soloEnCartola.length > 0 && (
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={importarNuevos}
                      disabled={importando}
                    >
                      {importando ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                      Importar {resultado.soloEnCartola.length} nuevos
                    </Button>
                  )}
                  {importados && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                      {resultado.soloEnCartola.length} importados
                    </Badge>
                  )}
                </>
              ) : (
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={analizar}
                  disabled={!archivo || cargando}
                >
                  {cargando ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                  Analizar cartola
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
