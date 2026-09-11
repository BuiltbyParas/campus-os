import { eduProgress } from '@/data/edu'
import type { EduProgress } from '@/types'

import { request } from './http'

/**
 * Co-curricular reads.
 *
 * Kept separate from `academics` because EDU-Revolution is tracked by a
 * different office and will almost certainly be a different backend service —
 * the seam should sit where the organisational boundary already is.
 */
export function getEduProgress(): Promise<EduProgress> {
  return request('/edu-revolution', () => eduProgress)
}
