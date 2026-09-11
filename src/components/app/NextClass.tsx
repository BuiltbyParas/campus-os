import { ArrowUpRight, Clock3, MapPin, User } from 'lucide-react'
import { Link } from 'react-router-dom'

import { courseById, sessionKindLabel, weekdayLabel } from '@/data'
import { cn, formatTime } from '@/lib/utils'
import type { ClassSession, Weekday } from '@/types'

/**
 * The single most useful thing on the dashboard: where the student has to be
 * next. It is the largest element on the screen because it answers the question
 * a student opens the app to ask.
 */
export function NextClass({
  session,
  day,
  isToday,
  minutesUntil,
  className,
}: {
  session: ClassSession
  day: Weekday
  isToday: boolean
  /** Minutes until the class starts. Negative while it is running. */
  minutesUntil: number
  className?: string
}) {
  const course = courseById.get(session.courseId)
  const ongoing = minutesUntil <= 0 && session.status === 'ongoing'

  const when = ongoing
    ? 'Happening now'
    : isToday
      ? minutesUntil < 60
        ? `Starts in ${Math.max(1, Math.round(minutesUntil))} min`
        : `Today at ${formatTime(session.startTime)}`
      : `${weekdayLabel[day]} at ${formatTime(session.startTime)}`

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-card border border-line bg-surface p-5 sm:p-6',
        className,
      )}
    >
      {/* A single soft light source behind the card, tinted by the accent. It is
          the only ambient gradient on the dashboard — more would be noise. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-brand/15 blur-[80px]"
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium',
              ongoing ? 'bg-ok-soft text-ok-ink' : 'bg-brand-soft text-brand-ink',
            )}
          >
            {ongoing ? (
              <span className="size-1.5 rounded-full bg-ok" aria-hidden />
            ) : (
              <Clock3 className="size-3.5" aria-hidden />
            )}
            {when}
          </span>
          <span className="text-[11.5px] text-ink-subtle">
            {sessionKindLabel[session.kind]}
          </span>
        </div>

        <h2 className="mt-4 text-[24px] font-semibold leading-tight tracking-tight text-ink sm:text-[30px]">
          {course?.name ?? 'Class'}
        </h2>

        <dl className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13.5px]">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Time</dt>
            <Clock3 className="size-4 text-ink-subtle" aria-hidden />
            <dd className="text-ink-muted">
              {formatTime(session.startTime)} – {formatTime(session.endTime)}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Location</dt>
            <MapPin className="size-4 text-ink-subtle" aria-hidden />
            <dd className="text-ink-muted">
              {session.block} · {session.room}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Faculty</dt>
            <User className="size-4 text-ink-subtle" aria-hidden />
            <dd className="text-ink-muted">{session.faculty}</dd>
          </div>
        </dl>

        <Link
          to="/app/timetable"
          className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink transition-colors hover:text-ink"
        >
          View full timetable
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
