import type { AttendanceStatus, CourseAttendance } from '@/types'

/**
 * Attendance arithmetic, kept in one place.
 *
 * The attendance screen, the dashboard and the AI assistant all quote these
 * numbers, so they must be derived the same way everywhere — a student who is
 * told "you can miss 2" on one screen must not be told "3" on another.
 *
 * The backend is expected to return raw `attended` / `held` counts; every
 * derived figure below is computed on the client from those two numbers.
 */

/** A course sits in the at-risk band when this many absences would sink it. */
const AT_RISK_MARGIN = 2

export function percentage(attended: number, held: number) {
  if (held <= 0) return 0
  return (attended / held) * 100
}

/**
 * How many further classes can be missed while still finishing at or above the
 * requirement. Assumes every missed class is also a held class.
 */
export function classesCanMiss(attended: number, held: number, required: number) {
  if (required <= 0) return Infinity
  return Math.max(0, Math.floor((attended * 100) / required - held))
}

/**
 * How many consecutive classes must be attended to climb back to the
 * requirement. Returns 0 when the student is already at or above it.
 */
export function classesMustAttend(attended: number, held: number, required: number) {
  if (percentage(attended, held) >= required) return 0
  if (required >= 100) return Infinity
  return Math.ceil((required * held - 100 * attended) / (100 - required))
}

export function attendanceStatus(
  attended: number,
  held: number,
  required: number,
): AttendanceStatus {
  if (percentage(attended, held) < required) return 'below'
  return classesCanMiss(attended, held, required) <= AT_RISK_MARGIN ? 'at-risk' : 'safe'
}

/**
 * The running percentage after each week, from a weekly `[attended, held]`
 * ledger.
 *
 * Cumulative rather than per-week on purpose: attendance *is* a running total,
 * and a chart of isolated weeks would swing wildly on a week with two classes
 * in it while the figure the student is judged on barely moved.
 */
export function trendFromWeeks(weeks: [number, number][]): number[] {
  let attended = 0
  let held = 0
  return weeks.map(([weekAttended, weekHeld]) => {
    attended += weekAttended
    held += weekHeld
    return percentage(attended, held)
  })
}

/** Builds the full derived record the UI consumes from raw counts. */
export function buildCourseAttendance(input: {
  courseId: string
  attended: number
  held: number
  requiredPercentage: number
  trend?: number[]
}): CourseAttendance {
  const { courseId, attended, held, requiredPercentage, trend } = input
  return {
    trend,
    courseId,
    attended,
    held,
    percentage: percentage(attended, held),
    requiredPercentage,
    status: attendanceStatus(attended, held, requiredPercentage),
    canMiss: classesCanMiss(attended, held, requiredPercentage),
    mustAttend: classesMustAttend(attended, held, requiredPercentage),
  }
}

export const attendanceStatusLabel: Record<AttendanceStatus, string> = {
  safe: 'On track',
  'at-risk': 'At risk',
  below: 'Below requirement',
}

export const attendanceStatusTone: Record<AttendanceStatus, 'ok' | 'warn' | 'danger'> = {
  safe: 'ok',
  'at-risk': 'warn',
  below: 'danger',
}
