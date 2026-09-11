import { buildCourseResult, buildResultsSummary } from '@/lib/results'
import type { Assessment, ResultsSummary } from '@/types'

import { hoursAgo } from './_time'

/**
 * Assessed work for the demo student.
 *
 * Raw scores only — every percentage in the product is derived from these by
 * `lib/results`. Fictional: these are not real marks, and the UI never presents
 * them as an official academic record.
 */
const assessments: Assessment[] = [
  // Database Management Systems — the course the demo narrative revolves around.
  { id: 'as_dbms_1', courseId: 'crs_dbms', name: 'CA 1', score: 17, maxScore: 30, weight: 15, publishedAt: hoursAgo(720) },
  { id: 'as_dbms_2', courseId: 'crs_dbms', name: 'CA 2', score: 19, maxScore: 30, weight: 15, publishedAt: hoursAgo(300) },
  { id: 'as_dbms_3', courseId: 'crs_dbms', name: 'Mid-term', score: 26, maxScore: 40, weight: 20, publishedAt: hoursAgo(20) },

  { id: 'as_cn_1', courseId: 'crs_cn', name: 'CA 1', score: 24, maxScore: 30, weight: 15, publishedAt: hoursAgo(700) },
  { id: 'as_cn_2', courseId: 'crs_cn', name: 'CA 2', score: 22, maxScore: 30, weight: 15, publishedAt: hoursAgo(280) },
  { id: 'as_cn_3', courseId: 'crs_cn', name: 'Mid-term', score: 30, maxScore: 40, weight: 20, publishedAt: hoursAgo(96) },

  { id: 'as_c_1', courseId: 'crs_c', name: 'CA 1', score: 27, maxScore: 30, weight: 15, publishedAt: hoursAgo(710) },
  { id: 'as_c_2', courseId: 'crs_c', name: 'CA 2', score: 26, maxScore: 30, weight: 15, publishedAt: hoursAgo(290) },
  { id: 'as_c_3', courseId: 'crs_c', name: 'Mid-term', score: 34, maxScore: 40, weight: 20, publishedAt: hoursAgo(110) },

  { id: 'as_math_1', courseId: 'crs_math', name: 'CA 1', score: 21, maxScore: 30, weight: 15, publishedAt: hoursAgo(730) },
  { id: 'as_math_2', courseId: 'crs_math', name: 'CA 2', score: 20, maxScore: 30, weight: 15, publishedAt: hoursAgo(310) },

  { id: 'as_web_1', courseId: 'crs_web', name: 'CA 1', score: 26, maxScore: 30, weight: 15, publishedAt: hoursAgo(705) },
  { id: 'as_web_2', courseId: 'crs_web', name: 'CA 2', score: 25, maxScore: 30, weight: 15, publishedAt: hoursAgo(285) },
]

const byCourse = assessments.reduce<Record<string, Assessment[]>>((map, entry) => {
  ;(map[entry.courseId] ??= []).push(entry)
  return map
}, {})

export const resultsSummary: ResultsSummary = buildResultsSummary(
  Object.entries(byCourse).map(([courseId, entries]) => buildCourseResult(courseId, entries)),
)
