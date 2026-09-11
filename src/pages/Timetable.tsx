import { useState } from 'react'

import { SessionRow } from '@/components/app/SessionRow'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { courseById, weekdayLabel, weekdays, weekdayShort } from '@/data'
import { cn, formatTime } from '@/lib/utils'
import { findNextSession, sessionsForDay, weekdayFromDate, withStatus } from '@/services/academics'
import { useTimetable } from '@/services/queries'
import type { Weekday } from '@/types'

export default function Timetable() {
  const timetable = useTimetable()

  const now = new Date()
  const today = weekdayFromDate(now)
  const [selected, setSelected] = useState<Weekday>(today ?? 'mon')

  const sessions = withStatus(timetable.data ?? [], now)
  const daySessions = sessionsForDay(sessions, selected)

  /* The brief's priority: the student's next class is called out wherever the
     schedule is shown, not just the one currently running. */
  const next = findNextSession(sessions, now)

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Timetable"
        description="Your weekly schedule. The class running now is highlighted."
      />

      {/* --------------------------------------------------------- day picker */}
      <div
        role="tablist"
        aria-label="Day of the week"
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      >
        {weekdays.map((day) => {
          const active = day === selected
          const isToday = day === today
          const count = sessionsForDay(sessions, day).length

          return (
            <button
              key={day}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setSelected(day)}
              className={cn(
                'press flex min-w-[76px] flex-col items-center gap-1 rounded-tile border px-3 py-2.5',
                active
                  ? 'border-brand-border/50 bg-brand-soft text-ink'
                  : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              <span className="text-[13px] font-medium">{weekdayShort[day]}</span>
              <span
                className={cn(
                  'text-[11px]',
                  active ? 'text-brand-ink' : 'text-ink-subtle',
                )}
              >
                {count} {count === 1 ? 'class' : 'classes'}
              </span>
              {isToday ? (
                <span aria-hidden className="size-1 rounded-full bg-brand" />
              ) : (
                <span aria-hidden className="size-1" />
              )}
            </button>
          )
        })}
      </div>

      {/* ------------------------------------------------------------- day */}
      {timetable.isPending ? (
        <div className="rounded-card border border-line bg-surface p-5">
          <Skeleton className="h-4 w-32" />
          <SkeletonRows className="mt-5" count={4} />
        </div>
      ) : timetable.isError ? (
        <ErrorState
          title="Timetable is unavailable"
          description="We could not load your schedule just now."
          onRetry={() => timetable.refetch()}
        />
      ) : (
        <section className="rounded-card border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-[16px] font-semibold tracking-tight text-ink">
              {weekdayLabel[selected]}
              {selected === today ? (
                <span className="ml-2 text-[12.5px] font-normal text-brand-ink">Today</span>
              ) : null}
            </h2>
            <span className="text-[12.5px] text-ink-subtle">
              {daySessions.length} {daySessions.length === 1 ? 'class' : 'classes'}
            </span>
          </div>

          {daySessions.length === 0 ? (
            <p className="px-5 py-12 text-center text-[14px] text-ink-muted">
              No classes on {weekdayLabel[selected]}.
            </p>
          ) : (
            <ul className="p-2">
              {daySessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  isNext={session.id === next?.session.id}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ------------------------------------------------------ week overview */}
      {!timetable.isPending && !timetable.isError ? (
        <section className="hidden lg:block">
          <h2 className="mb-3 text-[17px] font-semibold tracking-tight text-ink">Full week</h2>
          <div className="overflow-x-auto rounded-card border border-line bg-surface">
            <div className="grid min-w-[860px] grid-cols-6 gap-px bg-line">
              {weekdays.map((day) => (
                <div key={day} className="bg-surface">
                  <div
                    className={cn(
                      'border-b border-line px-3 py-2.5 text-center text-[12.5px] font-medium',
                      day === today ? 'text-brand-ink' : 'text-ink-muted',
                    )}
                  >
                    {weekdayLabel[day]}
                  </div>

                  <div className="space-y-1.5 p-2">
                    {sessionsForDay(sessions, day).map((session) => {
                      const course = courseById.get(session.courseId)
                      return (
                        <div
                          key={session.id}
                          className={cn(
                            'rounded-tile border px-2.5 py-2',
                            session.status === 'ongoing'
                              ? 'border-brand-border/50 bg-brand-soft'
                              : 'border-line bg-surface-raised',
                          )}
                        >
                          <p className="text-[11px] tabular-nums text-ink-subtle">
                            {formatTime(session.startTime)}
                          </p>
                          <p className="mt-0.5 text-[12.5px] font-medium leading-snug text-ink">
                            {course?.short ?? 'Class'}
                          </p>
                          <p className="mt-0.5 text-[11px] text-ink-subtle">
                            {session.block} · {session.room}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </PageContainer>
  )
}
