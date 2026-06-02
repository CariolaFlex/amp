export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function daysDiff(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}
