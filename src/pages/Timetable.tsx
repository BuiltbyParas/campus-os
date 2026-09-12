import { useState } from 'react'

import { NowNext } from '@/components/app/NowNext'
import { SessionRow } from '@/components/app/SessionRow'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { courseById, weekdayLabel, weekdays, weekdayShort } from '@/data'
import { buildDayAgenda } from '@/lib/agenda'
import { cn, formatTime } from '@/lib/utils'
import { findNextSession, sessionsForDay, weekdayFromDate, withStatus } from '@/services/academics'
import { useDeadlines, useEvents, useTimetable } from '@/services/queries'
import { toLocalIsoDate } from '@/data'
import type { Weekday } from '@/types'

export default function Timetable() {
  const timetable = useTimetable()
  const deadlines = useDeadlines()
  const events = useEvents()

  const now = new Date()
  const today = weekdayFromDate(now)
  const [selected, setSelected] = useState<Weekday>(today ?? 'mon')

  const sessions = withStatus(timetable.data ?? [], now)
  const daySessions = sessionsForDay(sessions, selected)

  /* The brief's priority: the student's next class is called out wherever the
     schedule is shown, not just the one currently running. */
  const next = findNextSession(sessions, now)

  /* Today's merged agenda drives the Now / Next band, so the timetable opens on
     "where do I have to be" rather than on a grid the student has to read. */
  const todayAgenda = today
    ? buildDayAgenda({
        sessions: sessionsForDay(sessions, today),
        deadlines: deadlines.data ?? [],
        events: events.data ?? [],
        isoDate: toLocalIsoDate(now),
        at: now,
      })
    : []
  const currentItem = todayAgenda.find((item) => item.status === 'now')
  const nextItem = todayAgenda.find((item) => item.status === 'next')
  const laterItems = todayAgenda.filter(
    (item) => item.status === 'upcoming' && item.kind !== 'gap',
  )

  return (
      <div className="border-b border-[rgba(99,102,241,0.1)] pb-4">
        <h1 className="text-[28px] font-bold text-white tracking-tight">Timetable</h1>
        <p className="text-[14px] text-[#a0aec0]">
          Weekly lecture routine and real-time room assignments.
        </p>
      </div>

      {/* -------------------------------------------------- now / next / later */}
      {!timetable.isPending && !timetable.isError && today ? (
        <div className="space-y-3">
          <NowNext now={currentItem} next={nextItem} />

          {laterItems.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Later Today
              </span>
              {laterItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(99,102,241,0.2)] bg-[#1a1f2e] px-3.5 py-1 text-[13px] text-white"
                >
                  <span className="tabular-nums text-[#6366f1] font-semibold">
                    {formatTime(item.startTime)}
                  </span>
                  <span className="truncate">{item.title}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* --------------------------------------------------------- day picker */}
      <div
        role="tablist"
        aria-label="Day of the week"
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
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
                'flex min-w-[80px] flex-col items-center justify-center rounded-[10px] border px-4 py-2.5 transition-all cursor-pointer',
                active
                  ? 'border-[#6366f1] bg-[#6366f1] text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)]'
                  : 'border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] text-[#a0aec0] hover:border-[rgba(99,102,241,0.3)] hover:text-white',
              )}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                {weekdayShort[day]}
              </span>
              <span className="text-[16px] font-bold mt-0.5">
                {count} {count === 1 ? 'class' : 'classes'}
              </span>
              {isToday && (
                <span className={cn('size-1.5 rounded-full mt-1.5', active ? 'bg-white' : 'bg-[#10b981]')} />
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
