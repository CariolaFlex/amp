'use client';

import * as React from 'react';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, Search, X, Download, MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  exportable?: boolean;
  onExport?: () => void;
  stickyHeader?: boolean;
  className?: string;
  rowClassName?: (row: T, index: number) => string | undefined;
  getRowId?: (row: T) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: Record<string, any>, path: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return path.split('.').reduce((acc: any, part) => acc?.[part], obj);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  data, columns, loading = false, emptyMessage = 'Sin resultados',
  searchable = true, searchPlaceholder = 'Buscar...',
  pagination = true, pageSize: initialPageSize = 15,
  selectable = false, onRowClick, actions,
  exportable = false, onExport, stickyHeader = false,
  className, rowClassName, getRowId = (r) => JSON.stringify(r),
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => String(getNestedValue(row, col.key as string) ?? '').toLowerCase().includes(q))
    );
  }, [data, searchQuery, columns]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = getNestedValue(a, sortKey);
      const bv = getNestedValue(b, sortKey);
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return (av < bv ? -1 : 1) * (sortDir === 'asc' ? 1 : -1);
    });
  }, [filtered, sortKey, sortDir]);

  const paginated = React.useMemo(() => {
    if (!pagination) return sorted;
    return sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [sorted, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sorted.length / pageSize);

  React.useEffect(() => { setCurrentPage(1); }, [searchQuery, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {(searchable || exportable) && (
        <div className="flex items-center justify-between gap-3">
          {searchable && (
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-8 h-8 text-xs" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          {exportable && (
            <Button variant="outline" size="sm" onClick={onExport} className="h-8 text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />Exportar
            </Button>
          )}
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <div className={cn('overflow-auto', stickyHeader && 'max-h-[560px]')}>
          <table className="w-full text-sm">
            <thead className={cn('bg-muted/40 border-b', stickyHeader && 'sticky top-0 z-10')}>
              <tr>
                {selectable && <th className="w-10 px-3 py-2.5"><input type="checkbox" className="h-3.5 w-3.5" onChange={() => {}} /></th>}
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={cn('px-3 py-2.5 text-left text-xs font-medium text-muted-foreground', col.align === 'right' && 'text-right', col.align === 'center' && 'text-center', col.sortable && 'cursor-pointer select-none hover:text-foreground', col.className)}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && (sortKey === String(col.key)
                        ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)
                        : <ArrowUpDown className="h-3 w-3 opacity-40" />)}
                    </span>
                  </th>
                ))}
                {actions && <th className="w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i}>{columns.map((c) => <td key={String(c.key)} className="px-3 py-2.5"><div className="h-3.5 w-20 rounded bg-muted animate-pulse" /></td>)}</tr>
                ))
                : paginated.length === 0
                  ? <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-3 py-10 text-center text-sm text-muted-foreground">{emptyMessage}</td></tr>
                  : paginated.map((row, idx) => (
                    <tr
                      key={getRowId(row)}
                      className={cn('hover:bg-muted/30 transition-colors', onRowClick && 'cursor-pointer', rowClassName?.(row, idx))}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="h-3.5 w-3.5" /></td>}
                      {columns.map((col) => {
                        const val = getNestedValue(row, String(col.key));
                        return (
                          <td key={String(col.key)} className={cn('px-3 py-2.5 text-sm', col.align === 'right' && 'text-right', col.align === 'center' && 'text-center', col.className)}>
                            {col.render ? col.render(val, row, idx) : (val as React.ReactNode) ?? '—'}
                          </td>
                        );
                      })}
                      {actions && (
                        <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">{actions(row)}</DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {pagination && sorted.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Mostrando</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{[10, 15, 25, 50].map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <span>de {sorted.length} registros</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-3.5 w-3.5" /></Button>
            <span className="px-2">Pág. {currentPage} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
