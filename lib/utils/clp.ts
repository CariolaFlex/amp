export function formatCLP(amount: number): string {
  return '$ ' + Math.round(amount).toLocaleString('es-CL');
}

export function parseCLP(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
}

export function formatUF(amount: number): string {
  return 'UF ' + amount.toFixed(4).replace('.', ',');
}
