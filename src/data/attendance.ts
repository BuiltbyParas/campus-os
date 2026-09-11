import {
  attendanceStatus,
  buildCourseAttendance,
  percentage,
  trendFromWeeks,
} from '@/lib/attendance'
import type { AttendanceSummary } from '@/types'

import { hoursAgo } from './_time'

/**
 * Raw attendance for the demo student, as a weekly ledger.
 *
 * Only `[attended, held]` per teaching week is stored. The semester totals,
 * every percentage, every margin, every status *and* the trend line are all
 * derived from this by `lib/attendance` — so the sparkline on the attendance
 * screen cannot drift from the number printed beside it, because they are the
 * same arithmetic run over the same rows.
 *
 * This is also the shape a real API would return: a register is a list of
 * sessions, not a pre-computed percentage.
 *
 * The 75% requirement is a DEMO figure used to make the interface meaningful.
 * It is not a real institutional rule, and the UI labels it as demo everywhere
 * it appears.
 */
export const DEMO_REQUIRED_PERCENTAGE = 75

/** `[attended, held]` per week, oldest first. Five teaching weeks so far. */
const weeklyLedger: Record<string, [number, number][]> = {
  /* The narrative course: starts perfect, slides under the line by week five. */
  crs_dbms: [
    [5, 5],
    [4, 5],
    [4, 5],
    [3, 5],
    [2, 5],
  ],
  crs_cn: [
    [6, 7],
    [5, 7],
    [5, 6],
    [5, 6],
    [5, 6],
  ],
  crs_c: [
    [5, 5],
    [4, 5],
    [4, 5],
    [4, 5],
    [5, 5],
  ],
  crs_math: [
    [4, 5],
    [4, 5],
    [4, 5],
    [3, 5],
    [4, 5],
  ],
  crs_web: [
    [5, 5],
    [4, 5],
    [4, 5],
    [4, 5],
    [4, 5],
  ],
}

const totals = Object.entries(weeklyLedger).map(([courseId, weeks]) => ({
  courseId,
  attended: weeks.reduce((sum, [attended]) => sum + attended, 0),
  held: weeks.reduce((sum, [, held]) => sum + held, 0),
  trend: trendFromWeeks(weeks),
}))

const totalAttended = totals.reduce((sum, row) => sum + row.attended, 0)
const totalHeld = totals.reduce((sum, row) => sum + row.held, 0)

/** The overall running percentage, summed across every course week by week. */
const weekCount = Math.max(...Object.values(weeklyLedger).map((weeks) => weeks.length))
const overallWeeks: [number, number][] = Array.from({ length: weekCount }, (_, week) =>
  Object.values(weeklyLedger).reduce<[number, number]>(
    ([attended, held], weeks) => {
      const entry = weeks[week]
      return entry ? [attended + entry[0], held + entry[1]] : [attended, held]
    },
    [0, 0],
  ),
)

export const attendanceSummary: AttendanceSummary = {
  overallPercentage: percentage(totalAttended, totalHeld),
  requiredPercentage: DEMO_REQUIRED_PERCENTAGE,
  totalAttended,
  totalHeld,
  status: attendanceStatus(totalAttended, totalHeld, DEMO_REQUIRED_PERCENTAGE),
  courses: totals.map((row) =>
    buildCourseAttendance({ ...row, requiredPercentage: DEMO_REQUIRED_PERCENTAGE }),
  ),
  trend: trendFromWeeks(overallWeeks),
  source: 'demo',
  updatedAt: hoursAgo(3),
}
