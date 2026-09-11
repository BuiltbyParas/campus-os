import { examSchedule } from '@/data/exams'
import type { ExamSchedule } from '@/types'

import { request } from './http'

/**
 * Examination reads.
 *
 * The schedule and the seating plan are one call here because a student never
 * wants one without the other — "when is my exam" and "where do I sit" are the
 * same question asked twice. If the backend publishes them from two systems,
 * joining them belongs on that side of the seam, not in the UI.
 */
export function getExams(): Promise<ExamSchedule> {
  return request('/examinations', () => examSchedule)
}
