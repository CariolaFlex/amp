'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { validarRut, formatearRut } from '@/lib/validators/rut';
import { Loader2, Building2, User } from 'lucide-react';
import type { ServelResult } from '@/app/api/rut/route';

interface Props {
  value: string;
  onChange: (rut: string) => void;
  onSelect: (result: ServelResult) => void;
  placeholder?: string;
  className?: string;
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export function RutAutocomplete({ value, onChange, onSelect, placeholder, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ServelResult[]>([]);
  const [open, setOpen] = useState(false);
  const [rutError, setRutError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 300);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    const q = debouncedValue.trim();
    if (q.length < 2) { setResults([]); setOpen(false); return; }

    let cancelled = false;
    setLoading(true);
    fetch(`/api/rut?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data: ServelResult[]) => {
        if (cancelled) return;
        setResults(Array.isArray(data) ? data : []);
        setOpen(Array.isArray(data) && data.length > 0);
      })
      .catch(() => setResults([]))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedValue]);

  function handleChange(v: string) {
    onChange(v);
    if (v.length < 3) { setRutError(''); return; }
    setRutError(validarRut(v) ? '' : 'RUT inválido (módulo 11)');
  }

  function handleBlur() {
    if (value && !rutError) onChange(formatearRut(value));
    setTimeout(() => setOpen(false), 150);
  }

  function handleSelect(r: ServelResult) {
    onChange(r.rut);
    setRutError('');
    setOpen(false);
    setResults([]);
    onSelect(r);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder ?? 'Ej: 12.345.678-9 o nombre empresa'}
          className={cn('font-mono pr-7', rutError && 'border-destructive', className)}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {rutError && <p className="mt-1 text-xs text-destructive">{rutError}</p>}

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg">
          {results.map((r) => (
            <li key={r.rut}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted"
              >
                {r.tipo === 'empresa'
                  ? <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                  : <User      className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.nombre}</p>
                  <p className="font-mono text-xs text-muted-foreground">{r.rut}</p>
                </div>
              </button>
            </li>
          ))}
          <li className="border-t px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground">Fuente: Registro SII / SERVEL</p>
          </li>
        </ul>
      )}
    </div>
  );
}
