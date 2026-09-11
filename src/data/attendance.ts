import { buildCourseAttendance, attendanceStatus, percentage } from '@/lib/attendance'
import type { AttendanceSummary } from '@/types'

import { hoursAgo } from './_time'

/**
 * Raw attendance counts for the demo student.
 *
 * Only `attended` and `held` are stored — every percentage, margin and status
 * shown in the product is derived from these by `lib/attendance`, exactly as it
 * will be when a real API returns the same two numbers.
 *
 * The 75% requirement is a DEMO figure used to make the interface meaningful.
 * It is not a real institutional rule, and the UI labels it as demo everywhere
 * it appears.
 */
export const DEMO_REQUIRED_PERCENTAGE = 75

interface RawCourseAttendance {
  courseId: string
  attended: number
  held: number
}

const raw: RawCourseAttendance[] = [
  { courseId: 'crs_dbms', attended: 18, held: 25 }, // 72%
  { courseId: 'crs_cn', attended: 26, held: 32 }, // 81%
  { courseId: 'crs_c', attended: 22, held: 25 }, // 88%
  { courseId: 'crs_math', attended: 19, held: 25 }, // 76%
  { courseId: 'crs_web', attended: 21, held: 25 }, // 84%
]

const totalAttended = raw.reduce((sum, row) => sum + row.attended, 0)
const totalHeld = raw.reduce((sum, row) => sum + row.held, 0)

export const attendanceSummary: AttendanceSummary = {
  overallPercentage: percentage(totalAttended, totalHeld),
  requiredPercentage: DEMO_REQUIRED_PERCENTAGE,
  totalAttended,
  totalHeld,
  status: attendanceStatus(totalAttended, totalHeld, DEMO_REQUIRED_PERCENTAGE),
  courses: raw.map((row) =>
    buildCourseAttendance({ ...row, requiredPercentage: DEMO_REQUIRED_PERCENTAGE }),
  ),
  source: 'demo',
  updatedAt: hoursAgo(3),
}
