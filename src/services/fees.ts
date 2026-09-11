import { feesSummary } from '@/data/fees'
import type { FeesSummary } from '@/types/fees'
import { request } from './http'

export function getFees(): Promise<FeesSummary> {
  return request('/fees', () => feesSummary)
}
