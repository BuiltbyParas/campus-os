import type { DataSource, Id } from '@/types'

export interface FeeLineItem {
  id: Id
  label: string
  amount: number
  /** If true, this line reduces the total (scholarship, waiver). */
  isCredit: boolean
}

export interface PaymentRecord {
  id: Id
  date: string        // ISO date
  amount: number
  method: 'online' | 'bank' | 'cash'
  receiptId: string   // e.g. 'RCP-20260801-001'
  status: 'completed' | 'pending' | 'failed'
}

export interface FeesSummary {
  semesterLabel: string   // 'Semester 2 · 2026-27'
  totalFee: number
  totalPaid: number
  pendingAmount: number
  dueDate: string         // ISO date
  lineItems: FeeLineItem[]
  payments: PaymentRecord[]
  scholarshipApplied: number
  source: DataSource
}
