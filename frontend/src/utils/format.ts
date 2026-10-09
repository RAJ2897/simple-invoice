import dayjs from 'dayjs'

const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Uses the symbol stored with the invoice ("AU$", "£") rather than Intl's
 * locale-dependent one, which would render AUD and USD both as "$".
 */
export function formatMoney(amount: number, symbol: string): string {
  const sign = amount < 0 ? '-' : ''
  return `${sign}${symbol}${amountFormatter.format(Math.abs(amount))}`
}

/** "2026-06-03" → "3 Jun 2026" */
export function formatDate(isoDate: string): string {
  return dayjs(isoDate).format('D MMM YYYY')
}

export function todayIso(): string {
  return dayjs().format('YYYY-MM-DD')
}

/**
 * Human hint for the due date column: "Due today", "Due in 3 days", "12 days overdue".
 * Returns null for paid invoices where the hint is noise.
 */
export function dueDateHint(dueDate: string, isPaid: boolean, today = todayIso()): string | null {
  if (isPaid) return null
  const days = dayjs(dueDate).diff(dayjs(today), 'day')
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days > 1) return days <= 30 ? `Due in ${days} days` : null
  const late = Math.abs(days)
  return late === 1 ? '1 day overdue' : `${late} days overdue`
}
