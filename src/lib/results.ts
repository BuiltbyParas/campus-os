import type { Assessment, CourseResult, ResultsSummary } from '@/types'

/**
 * Result arithmetic, kept in one place for the same reason as attendance: the
 * results screen, the command palette and the assistant all quote these
 * figures, and they must never disagree.
 *
 * The backend is expected to return raw assessments. Everything below is
 * derived from them on the client.
 */

/** Weighted marks earned, expressed against the weight assessed so far. */
export function buildCourseResult(courseId: string, assessments: Assessment[]): CourseResult {
  const assessed = assessments.reduce((sum, entry) => sum + entry.weight, 0)
  const obtained = assessments.reduce(
    (sum, entry) => sum + (entry.score / entry.maxScore) * entry.weight,
    0,
  )

  const publishedAt = assessments
    .map((entry) => entry.publishedAt)
    .sort()
    .at(-1)

  return {
    courseId,
    assessments: [...assessments].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt)),
    obtained,
    assessed,
    percentage: assessed > 0 ? (obtained / assessed) * 100 : 0,
    remainingWeight: Math.max(0, 100 - assessed),
    publishedAt: publishedAt ?? new Date(0).toISOString(),
  }
}

export function buildResultsSummary(courses: CourseResult[]): ResultsSummary {
  const assessed = courses.reduce((sum, course) => sum + course.assessed, 0)
  const obtained = courses.reduce((sum, course) => sum + course.obtained, 0)

  const latest = [...courses].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0]

  return {
    courses,
    overallPercentage: assessed > 0 ? (obtained / assessed) * 100 : 0,
    latest,
    source: 'demo',
  }
}

/**
 * The best and worst still reachable, given the weight left unassessed.
 *
 * This is the honest way to answer "am I in trouble?" — not a prediction, just
 * the range the remaining assessments still allow.
 */
export function reachableRange(result: CourseResult) {
  const earned = result.obtained
  const remaining = result.remainingWeight
  return {
    best: Math.min(100, earned + remaining),
    worst: earned,
  }
}


/* ------------------------------------------------------- re-evaluation */

/**
 * How long a published result stays open for re-evaluation.
 *
 * **A demo figure**, not an institutional rule. It is stated as such wherever
 * the product shows it, for the same reason the 75% attendance threshold is:
 * CampusOS must never present an invented deadline as official policy.
 */
export const DEMO_REVALUATION_WINDOW_DAYS = 15

export interface RevaluationWindow {
  open: boolean
  /** ISO date the window closes. */
  closesOn: string
  daysLeft: number
}

/**
 * The re-evaluation window for a published result.
 *
 * Derived from the publication date rather than stored, so it stays correct
 * however long after publication the student opens the app.
 */
export function revaluationWindow(result: CourseResult, at = new Date()): RevaluationWindow {
  const published = new Date(result.publishedAt)
  const closes = new Date(published)
  closes.setDate(closes.getDate() + DEMO_REVALUATION_WINDOW_DAYS)
  closes.setHours(23, 59, 59, 999)

  const daysLeft = Math.ceil((closes.getTime() - at.getTime()) / 86_400_000)

  return {
    open: daysLeft > 0,
    closesOn: `${closes.getFullYear()}-${String(closes.getMonth() + 1).padStart(2, '0')}-${String(closes.getDate()).padStart(2, '0')}`,
    daysLeft: Math.max(0, daysLeft),
  }
}
