/** Maior intervalo aceito (também validado nas regras do Firestore). */
export const MAX_INTERVAL = 365

/** Intervalos disponíveis (em dias), em ordem crescente. */
export const INTERVALS = [1, 3, 5, 7, 15, 30, 60] as const

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** Data local (sem fuso) no formato YYYY-MM-DD. */
export function toLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function today(): string {
  return toLocalDate(new Date())
}

export function addDays(days: number, from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return toLocalDate(d)
}

export function isDue(nextReview: string, ref = today()): boolean {
  return nextReview <= ref
}

/** Próximo degrau da escada de intervalos, usado como sugestão ao acertar. */
export function nextInterval(current: number): number {
  return INTERVALS.find((i) => i > current) ?? INTERVALS[INTERVALS.length - 1]
}

export function formatDays(days: number): string {
  return days === 1 ? '1 dia' : `${days} dias`
}

/** Descrição relativa amigável de uma data YYYY-MM-DD. */
export function describeReview(nextReview: string): string {
  const [y, m, d] = nextReview.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - now.getTime()) / 86_400_000)
  if (diff < 0) return `atrasado há ${formatDays(-diff)}`
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'amanhã'
  return `em ${formatDays(diff)}`
}
