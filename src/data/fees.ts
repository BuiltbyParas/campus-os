import type { FeesSummary } from '@/types/fees'
import { dayOffset } from './_time'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const feesSummary: FeesSummary = {
  semesterLabel: 'Semester 2 · 2026-27',
  totalFee: 108000,
  totalPaid: 71000,
  pendingAmount: 37000,
  dueDate: dayOffset(5),
  lineItems: [
    { id: 'fee_tuition', label: 'Tuition Fee', amount: 72000, isCredit: false },
    { id: 'fee_hostel', label: 'Hostel Fee', amount: 24000, isCredit: false },
    { id: 'fee_mess', label: 'Mess Charges', amount: 18000, isCredit: false },
    { id: 'fee_exam', label: 'Examination Fee', amount: 3500, isCredit: false },
    { id: 'fee_library', label: 'Library Fee', amount: 1500, isCredit: false },
    { id: 'fee_tech', label: 'Technology Fee', amount: 2500, isCredit: false },
    { id: 'fee_sports', label: 'Sports & Activity', amount: 1500, isCredit: false },
    { id: 'fee_scholarship', label: 'Scholarship (Merit)', amount: -15000, isCredit: true },
  ],
  payments: [
    {
      id: 'pay_1',
      date: '2026-08-01',
      amount: 40000,
      method: 'online',
      receiptId: 'RCP-20260801-001',
      status: 'completed',
    },
    {
      id: 'pay_2',
      date: '2026-08-20',
      amount: 31000,
      method: 'online',
      receiptId: 'RCP-20260820-002',
      status: 'completed',
    },
  ],
  scholarshipApplied: 15000,
  source: 'demo',
}
