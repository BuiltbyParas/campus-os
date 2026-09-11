import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { courseById } from '@/data'
import { attendanceStatusTone } from '@/lib/attendance'
import { cn } from '@/lib/utils'
import type { AttendanceSummary } from '@/types'

const dotTone = { ok: 'bg-ok', warn: 'bg-warn', danger: 'bg-danger' } as const
const textTone = { ok: 'text-ok-ink', warn: 'text-warn-ink', danger: 'text-danger-ink' } as const

/**
 * The mobile form of the attendance summary.
 *
 * On a phone the full ring sits too far down the page to do its job, and the
 * thing a student needs from that card is one sentence: the overall figure and
 * which course is in trouble. This is that sentence — not a shrunken card.
 */
export function AttendanceStrip({
  summary,
  className,
}: {
  summary: AttendanceSummary
  className?: string
}) {
  const weakest = [...summary.courses].sort((a, b) => a.percentage - b.percentage)[0]
  const tone = attendanceStatusTone[weakest?.status ?? summary.status]
  const course = weakest ? courseById.get(weakest.courseId) : undefined

  return (
    <Link
      to="/app/attendance"
      className={cn(
        'press flex items-center gap-3.5 rounded-card border border-line bg-surface px-4 py-3.5',
        className,
      )}
    >
      <span className="flex shrink-0 items-baseline gap-1">
        <span className="text-[20px] font-semibold leading-none tabular-nums text-ink">
          {Math.round(summary.overallPercentage)}%
        </span>
      </span>

      <span aria-hidden className="h-8 w-px shrink-0 bg-line" />

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-ink">Attendance</span>
        {weakest ? (
          <span className="mt-0.5 flex items-center gap-1.5">
            <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', dotTone[tone])} />
            <span className="truncate text-[12px] text-ink-subtle">
              {course?.short} {Math.round(weakest.percentage)}%
              <span className={cn('ml-1', textTone[tone])}>
                {weakest.status === 'below' ? 'below requirement' : 'close to the line'}
              </span>
            </span>
          </span>
        ) : null}
      </span>

      <ChevronRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
    </Link>
  )
}
