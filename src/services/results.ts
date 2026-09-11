import { resultsSummary } from '@/data/results'
import type { ResultsSummary } from '@/types/results'
import { request } from './http'

export function getResults(): Promise<ResultsSummary> {
  return request('/results', () => resultsSummary)
}
