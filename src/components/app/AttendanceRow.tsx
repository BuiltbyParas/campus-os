import { courseById } from '@/data'
import { attendanceStatusLabel, attendanceStatusTone } from '@/lib/attendance'
import { cn } from '@/lib/utils'
import type { CourseAttendance } from '@/types'

import { Badge } from '@/components/ui/Badge'
import { Meter } from '@/components/ui/Meter'
import { Sparkline } from '@/components/ui/Sparkline'

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

        <div className="flex shrink-0 items-center gap-4">
          {/* Where it is going, beside where it is. For a course sliding toward
              the line, the direction is the more actionable of the two. */}
          {attendance.trend && attendance.trend.length > 1 ? (
            <Sparkline
              values={attendance.trend}
              threshold={attendance.requiredPercentage}
              tone={tone}
              label={`${course?.short ?? 'Course'} attendance over ${attendance.trend.length} weeks, now ${percentage}% against a ${attendance.requiredPercentage}% requirement`}
              className="hidden sm:block"
            />
          ) : null}

          <div className="text-right">
            <p className="text-[18px] font-semibold leading-none tabular-nums text-ink">
              {percentage}%
            </p>
            <Badge tone={tone} className="mt-1.5">
              {attendanceStatusLabel[attendance.status]}
            </Badge>
          </div>
        </div>
      </div>

      {/* The requirement is a marker on the track, so the gap is visible rather
          than something the student has to compute from two numbers. */}
      <Meter
        value={percentage}
        threshold={attendance.requiredPercentage}
        tone={tone}
        label={`${course?.short ?? 'Course'} attendance`}
        className="mt-3"
      />

      <p className="mt-2 text-[12.5px] text-ink-muted">{consequence}</p>
    </div>
  )
}
