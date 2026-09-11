import { courseById, sessionKindLabel } from '@/data'
import { cn, formatTime } from '@/lib/utils'
import type { ClassSession } from '@/types'

/**
 * One class in a day's list. Used by both the dashboard and the timetable, so a
 * class looks the same wherever the student meets it.
 *
 * The mobile treatment is deliberate rather than a squeeze: the faculty name and
 * the session-kind label are dropped below `sm`, because on a 390px screen the
 * time, the course and the room are what a student is actually scanning for.
 */
export function SessionRow({
  session,
  isNext = false,
  className,
}: {
  session: ClassSession
  /** Marks the next class the student has to get to. */
  isNext?: boolean
  className?: string
}) {
  const course = courseById.get(session.courseId)
  const completed = session.status === 'completed'
  const ongoing = session.status === 'ongoing'
  const cancelled = session.status === 'cancelled'

  /* Only states worth interrupting the scan for survive on mobile. */
  const statusLabel = cancelled ? 'Cancelled' : ongoing ? 'Now' : isNext ? 'Next' : null

  return (
    <li
      className={cn(
        'relative flex items-start gap-3 rounded-tile px-3 py-3 transition-colors duration-200',
        ongoing && 'bg-brand-soft',
        isNext && !ongoing && 'bg-surface-raised',
        completed && 'opacity-50',
        className,
      )}
    >
      <div className="w-[46px] shrink-0 pt-0.5 sm:w-[52px]">
        <p className="text-[12.5px] font-medium tabular-nums text-ink">
          {formatTime(session.startTime)}
        </p>
        <p className="text-[11px] tabular-nums text-ink-subtle">{formatTime(session.endTime)}</p>
      </div>

      <span
        aria-hidden
        className={cn(
          'mt-1.5 size-1.5 shrink-0 rounded-full',
          ongoing
            ? 'bg-brand'
            : completed
              ? 'bg-ok'
              : cancelled
                ? 'bg-danger'
                : isNext
                  ? 'bg-brand-ink'
                  : 'bg-ink-subtle/40',
        )}
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-[14px] font-medium text-ink',
            cancelled && 'line-through decoration-danger/60',
          )}
        >
          {course?.name ?? 'Class'}
        </p>
        <p className="mt-0.5 truncate text-[12.5px] text-ink-subtle">
          {session.block} · {session.room}
          <span className="hidden sm:inline"> · {session.faculty}</span>
        </p>
      </div>

      <span
        className={cn(
          'shrink-0 pt-0.5 text-[11.5px]',
          statusLabel ? 'font-medium' : 'hidden sm:inline',
          cancelled
            ? 'text-danger-ink'
            : ongoing || isNext
              ? 'text-brand-ink'
              : 'text-ink-subtle',
        )}
      >
        {statusLabel ?? sessionKindLabel[session.kind]}
      </span>
    </li>
  )
}
