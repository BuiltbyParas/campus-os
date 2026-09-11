import { buildFeeSummary } from '@/lib/fees'
import type { FeeInstalment, FeeLine } from '@/types'

import { dayOffset } from './_time'

/**
 * Fee record for the demo student.
 *
 * Every figure here is **fictional**. These are not any institution's real fee
 * amounts, deadlines or scholarship terms, and the UI labels the whole record
 * as demo data wherever it appears. Amounts are whole rupees.
 *
 * The ledger is the source: the totals the product shows are derived from these
 * instalments by `lib/fees`, never written down separately.
 */

const breakdown: FeeLine[] = [
  { label: 'Tuition', amount: 120_000, note: 'Semester 2 · BCA' },
  { label: 'Hostel', amount: 40_000, note: 'Hostel 23 · twin sharing' },
  { label: 'Mess', amount: 16_000 },
  { label: 'Examination', amount: 4_500 },
]

const instalments: FeeInstalment[] = [
  {
    id: 'fee_1',
    label: 'Instalment 1',
    amount: 81_000,
    dueDate: dayOffset(-118),
    status: 'paid',
    paidOn: dayOffset(-120),
    method: 'Net banking',
    reference: 'TXN-40182',
  },
  {
    id: 'fee_2',
    label: 'Instalment 2',
    amount: 81_000,
    dueDate: dayOffset(-44),
    status: 'paid',
    paidOn: dayOffset(-46),
    method: 'UPI',
    reference: 'TXN-41967',
  },
  {
    id: 'fee_3',
    label: 'Instalment 3',
    amount: 18_500,
    dueDate: dayOffset(12),
    status: 'due',
  },
]

export const feeSummary = buildFeeSummary({
  currency: 'INR',
  breakdown,
  instalments,
  scholarship: { name: 'Merit scholarship', amount: 40_000 },
  source: 'demo',
})
