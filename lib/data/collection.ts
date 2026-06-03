'use client';

/**
 * Capa de datos genérica, persistente y SQL-ready.
 * -------------------------------------------------------------------------
 * Cada entidad del ERP es una `Collection<T>` respaldada hoy por localStorage.
 * Las firmas de los métodos (list/getById/create/update/remove) son `async`
 * a propósito: el día que llegue el backend SQL Server de Carlos, sólo se
 * reescribe el cuerpo de estos métodos para que hagan `fetch('/api/...')`
 * y NINGÚN componente que las consume necesita cambiar.
 *
 * Reactividad: `useCollection(col)` usa `useSyncExternalStore`, así las listas
 * y fichas se re-renderizan solas tras cada create/update/remove.
 *
 * Fechas: el contrato de tipos usa `Date`. Se persiste como ISO (JSON) y se
 * revive a `Date` al leer, según `dateFields`.
 */

import { useSyncExternalStore } from 'react';

export interface Entity {
  id: string;
}

export interface CollectionConfig<T extends Entity> {
  /** Clave en localStorage, ej: 'amp:clientes' */
  key: string;
  /** Campos que deben revivirse como Date al leer */
  dateFields?: (keyof T)[];
  /** Datos iniciales SÓLO si nunca se ha guardado nada (por defecto vacío) */
  seed?: T[];
}

const isBrowser = typeof window !== 'undefined';

function reviveDates<T extends Entity>(items: T[], dateFields?: (keyof T)[]): T[] {
  if (!dateFields || dateFields.length === 0) return items;
  return items.map((item) => {
    const next = { ...item } as T;
    for (const field of dateFields) {
      const value = next[field];
      if (typeof value === 'string' || typeof value === 'number') {
        // @ts-expect-error revival controlado por dateFields
        next[field] = new Date(value);
      }
    }
    return next;
  });
}

export class Collection<T extends Entity> {
  private readonly key: string;
  private readonly dateFields?: (keyof T)[];
  private readonly seed: T[];
  private cache: T[] | null = null;
  private listeners = new Set<() => void>();
  private static readonly EMPTY: never[] = [];

  constructor(config: CollectionConfig<T>) {
    this.key = config.key;
    this.dateFields = config.dateFields;
    this.seed = config.seed ?? [];

    // métodos usados como callbacks → bind
    this.subscribe = this.subscribe.bind(this);
    this.getSnapshot = this.getSnapshot.bind(this);
    this.getServerSnapshot = this.getServerSnapshot.bind(this);
  }

  /* ── almacenamiento interno ──────────────────────────────── */

  private load(): T[] {
    if (!isBrowser) return this.seed;
    const raw = window.localStorage.getItem(this.key);
    if (raw === null) {
      // primera vez: sembrar (vacío salvo que se configure seed)
      this.write(this.seed);
      return reviveDates(this.seed, this.dateFields);
    }
    try {
      const parsed = JSON.parse(raw) as T[];
      return reviveDates(parsed, this.dateFields);
    } catch {
      return [];
    }
  }

  private write(items: T[]): void {
    if (isBrowser) {
      window.localStorage.setItem(this.key, JSON.stringify(items));
    }
  }

  /** Devuelve la cache (la carga desde storage la primera vez). */
  private ensure(): T[] {
    if (this.cache === null) this.cache = this.load();
    return this.cache;
  }

  /** Reemplaza la cache, persiste y notifica a React. */
  private commit(items: T[]): void {
    this.cache = items;
    this.write(items);
    this.listeners.forEach((l) => l());
  }

  /* ── suscripción para useSyncExternalStore ───────────────── */

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): T[] {
    return this.ensure();
  }

  getServerSnapshot(): T[] {
    return Collection.EMPTY as unknown as T[];
  }

  /* ── API SQL-ready (async a propósito) ───────────────────── */

  async list(): Promise<T[]> {
    return this.ensure();
  }

  async getById(id: string): Promise<T | undefined> {
    return this.ensure().find((it) => it.id === id);
  }

  async query(predicate: (item: T) => boolean): Promise<T[]> {
    return this.ensure().filter(predicate);
  }

  async create(data: Omit<T, 'id'> & { id?: string }): Promise<T> {
    const record = { ...data, id: data.id ?? genId() } as T;
    this.commit([...this.ensure(), record]);
    return record;
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    let updated: T | undefined;
    const next = this.ensure().map((it) => {
      if (it.id !== id) return it;
      updated = { ...it, ...patch, id };
      return updated;
    });
    if (!updated) throw new Error(`[${this.key}] No existe el registro ${id}`);
    this.commit(next);
    return updated;
  }

  /** Crea si no existe, actualiza si existe (por id). */
  async upsert(record: T): Promise<T> {
    const exists = this.ensure().some((it) => it.id === record.id);
    if (exists) return this.update(record.id, record);
    this.commit([...this.ensure(), record]);
    return record;
  }

  async remove(id: string): Promise<void> {
    this.commit(this.ensure().filter((it) => it.id !== id));
  }

  /** Reemplaza TODO el contenido (útil para imports masivos). */
  async replaceAll(items: T[]): Promise<void> {
    this.commit(items);
  }

  /** Borra todos los registros de la colección. */
  async clear(): Promise<void> {
    this.commit([]);
  }
}

/* ── helpers ────────────────────────────────────────────────── */

/** ID único. Usa crypto.randomUUID cuando está disponible. */
export function genId(prefix?: string): string {
  const uuid =
    isBrowser && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix ? `${prefix}_${uuid}` : uuid;
}

/* ── hooks de React ─────────────────────────────────────────── */

/** Lista reactiva completa de una colección. */
export function useCollection<T extends Entity>(col: Collection<T>): T[] {
  return useSyncExternalStore(col.subscribe, col.getSnapshot, col.getServerSnapshot);
}

/** Un registro reactivo por id (undefined si no existe / aún cargando). */
export function useCollectionItem<T extends Entity>(
  col: Collection<T>,
  id: string | undefined,
): T | undefined {
  const items = useCollection(col);
  if (!id) return undefined;
  return items.find((it) => it.id === id);
}
