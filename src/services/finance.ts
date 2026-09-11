import { feeSummary } from '@/data/fees'
import type { FeeSummary } from '@/types'

import { request } from './http'

/**
 * Finance reads.
 *
 * The backend is expected to return the breakdown and the instalment ledger;
 * outstanding balance, next payment and payment history are all derived from
 * that ledger by `lib/fees` so they cannot drift from it.
 */
export function getFees(): Promise<FeeSummary> {
  return request('/fees', () => feeSummary)
}
