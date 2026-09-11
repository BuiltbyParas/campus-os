import { daysUntil } from '@/lib/utils'
import type { FeeInstalment, FeeStatus, FeeSummary, FeeLine } from '@/types'

/**
 * Fee arithmetic, kept in one place for the same reason as attendance and
 * results: the fees screen, the dashboard signal, the command palette and the
 * assistant all quote these figures and must never disagree.
 *
 * The backend is expected to return the breakdown and the instalment ledger.
 * Everything else — what is outstanding, what is due next, how long is left —
 * is derived from them here.
 */

/**
 * Indian digit grouping (1,80,500), which is what a student on this campus
 * expects to read. Falls back to the locale's own grouping for other
 * currencies rather than forcing lakhs onto them.
 */
export function formatMoney(amount: number, currency = 'INR') {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Human phrasing for a payment deadline. */
export function dueLabel(isoDate: string, at = new Date()) {
  const days = daysUntil(isoDate, at)
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}

/**
 * How loudly an instalment should read.
 *
 * Overdue and "due within a fortnight" are different situations and the UI
 * should not colour them the same; anything further out is information, not a
 * warning.
 */
export function instalmentTone(
  instalment: FeeInstalment,
  at = new Date(),
): 'ok' | 'warn' | 'danger' | 'info' {
  if (instalment.status === 'paid') return 'ok'
  const days = daysUntil(instalment.dueDate, at)
  if (days < 0) return 'danger'
  if (days <= 14) return 'warn'
  return 'info'
}

export const feeStatusLabel: Record<FeeStatus, string> = {
  paid: 'Paid',
  due: 'Due',
  upcoming: 'Upcoming',
}

/**
 * Builds the summary from raw lines and instalments.
 *
 * `totalPaid`, `outstanding` and `nextDue` are never stored — a stored total
 * can drift from the ledger it came from, and a fee figure that disagrees with
 * its own breakdown is the one number a student will not forgive.
 */
export function buildFeeSummary(input: {
  currency: string
  breakdown: FeeLine[]
  instalments: FeeInstalment[]
  scholarship?: { name: string; amount: number }
  source?: FeeSummary['source']
}): FeeSummary {
  const { currency, breakdown, instalments, scholarship, source = 'demo' } = input

  const totalPayable = instalments.reduce((sum, entry) => sum + entry.amount, 0)
  const totalPaid = instalments
    .filter((entry) => entry.status === 'paid')
    .reduce((sum, entry) => sum + entry.amount, 0)

  /* The next thing actually owed: the earliest unpaid instalment. */
  const nextDue = [...instalments]
    .filter((entry) => entry.status !== 'paid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]

  return {
    currency,
    totalPayable,
    totalPaid,
    outstanding: totalPayable - totalPaid,
    breakdown,
    instalments: [...instalments].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    scholarship,
    nextDue,
    source,
  }
}

export { type FeeSummary }
