import { courseById } from '@/data'
import { attendanceStatusLabel, attendanceStatusTone } from '@/lib/attendance'
import { cn } from '@/lib/utils'
import type { CourseAttendance } from '@/types'

import { Badge } from '@/components/ui/Badge'

const barTone = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
} as const

/**
 * A course's attendance as one row: percentage, the requirement line, and the
 * consequence in words. The consequence matters more than the bar — "you can
 * miss 2 more" is what a student actually acts on.
 */
export function AttendanceRow({
  attendance,
  className,
}: {
  attendance: CourseAttendance
  className?: string
}) {
  const course = courseById.get(attendance.courseId)
  const tone = attendanceStatusTone[attendance.status]
  const percentage = Math.round(attendance.percentage)

  const consequence =
    attendance.status === 'below'
      ? `Attend the next ${attendance.mustAttend} to reach ${attendance.requiredPercentage}%`
      : attendance.canMiss === 0
        ? 'One more absence drops you below the line'
        : `You can miss ${attendance.canMiss} more`

  return (
    <div className={cn('py-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-medium text-ink">
            {course?.name ?? 'Course'}
          </p>
          <p className="mt-0.5 text-[12.5px] text-ink-subtle">
            {course?.code} · {attendance.attended} of {attendance.held} classes attended
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[18px] font-semibold leading-none tabular-nums text-ink">
            {percentage}%
          </p>
          <Badge tone={tone} className="mt-1.5">
            {attendanceStatusLabel[attendance.status]}
          </Badge>
        </div>
      </div>

      {/* The requirement is a marker on the track, so the gap is visible rather
          than something the student has to compute from two numbers. */}
      <div className="relative mt-3 h-1.5 rounded-full bg-surface-muted">
        <div
          className={cn('h-full rounded-full transition-[width] duration-700', barTone[tone])}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
        <span
          aria-hidden
          className="absolute -top-1 h-3.5 w-px bg-ink-subtle"
          style={{ left: `${attendance.requiredPercentage}%` }}
        />
      </div>

      <p className="mt-2 text-[12.5px] text-ink-muted">{consequence}</p>
    </div>
  )
}
