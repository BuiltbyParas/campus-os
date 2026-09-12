import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

import { DayAxis } from '@/components/app/DayAxis'
import { NextClassHero } from '@/components/app/NextClassHero'
import { TodayTimeline } from '@/components/app/TodayTimeline'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { ErrorState } from '@/components/ui/States'
import { courseById, weekdayLabel, weekdays } from '@/data'
import { buildDayAgenda } from '@/lib/agenda'
import { easeOutSoft } from '@/lib/motion'
import { cn, formatTime } from '@/lib/utils'
import { sessionsForDay, weekdayFromDate, withStatus } from '@/services/academics'
import { useDeadlines, useEvents, useTimetable } from '@/services/queries'
import { toLocalIsoDate } from '@/data'
import type { Weekday } from '@/types'

/** The three ways a student actually asks about their schedule. */
type View = 'today' | 'tomorrow' | 'week'

/**
 * The timetable as time, not as a table.
 *
 * A weekly grid answers "what is on Thursday" — a question students ask rarely.
 * The questions they ask constantly are "what now", "what next" and "what about
 * tomorrow", so those are the modes, and the grid is one of them rather than
 * the whole screen.
 *
 * Today and Tomorrow render the *merged* agenda — classes, coursework and
 * events on one spine — because a day is not only its lectures.
 */
export default function Timetable() {
  const timetable = useTimetable()
  const deadlines = useDeadlines()
  const events = useEvents()
  const reduced = useReducedMotion()

  const now = new Date()
  const today = weekdayFromDate(now)
  const [view, setView] = useState<View>('today')

  const sessions = withStatus(timetable.data ?? [], now)

  /* Tomorrow can be a Sunday, which is not in the teaching week at all —
     `weekdayFromDate` returns null and the day renders as genuinely empty
     rather than silently falling back to Monday. */
  const tomorrowDate = new Date(now.getTime() + 86_400_000)
  const tomorrow = weekdayFromDate(tomorrowDate)

  const agendaFor = (day: Weekday | null, date: Date, at: Date) =>
    day
      ? buildDayAgenda({
          sessions: sessionsForDay(sessions, day),
          deadlines: deadlines.data ?? [],
          events: events.data ?? [],
          isoDate: toLocalIsoDate(date),
          at,
        })
      : []

  const todayAgenda = agendaFor(today, now, now)
  /* Tomorrow is read at its own start of day, so nothing in it is marked
     "past" merely because this afternoon has gone. */
  const tomorrowStart = new Date(tomorrowDate)
  tomorrowStart.setHours(0, 0, 0, 0)
  const tomorrowAgenda = agendaFor(tomorrow, tomorrowDate, tomorrowStart)

  const currentItem = todayAgenda.find((item) => item.status === 'now')
  const nextItem = todayAgenda.find((item) => item.status === 'next')

  const activeAgenda = view === 'tomorrow' ? tomorrowAgenda : todayAgenda
  const activeDay = view === 'tomorrow' ? tomorrow : today
  const activeClasses = activeAgenda.filter((item) => item.kind === 'class').length

  const options = [
    { value: 'today' as const, label: 'Today', count: todayAgenda.filter((i) => i.kind === 'class').length },
    { value: 'tomorrow' as const, label: 'Tomorrow', count: tomorrowAgenda.filter((i) => i.kind === 'class').length },
    { value: 'week' as const, label: 'Week' },
  ]

  const loading = timetable.isPending

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Timetable"
        description="Where you need to be, in the order you will meet it."
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[196px] w-full rounded-card" />
          <div className="rounded-card border border-line bg-surface p-5">
            <SkeletonRows count={4} />
          </div>
        </div>
      ) : timetable.isError ? (
        <ErrorState
          title="Timetable is unavailable"
          description="We could not load your schedule just now."
          onRetry={() => timetable.refetch()}
        />
      ) : (
        <>
          {/* --------------------------------------------- now / next / later */}
          {today ? <NextClassHero now={currentItem} next={nextItem} /> : null}

          <Tabs options={options} value={view} onChange={setView} label="Schedule view" />

          {/* The mode change is a move between related views, so it crossfades
              with a small directional shift rather than cutting. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={reduced ? undefined : { opacity: 0, y: 8 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: easeOutSoft }}
              className="space-y-5"
            >
              {view === 'week' ? (
                <WeekGrid sessions={sessions} today={today} />
              ) : (
                <>
                  {/* the shape of the day, with the live position marked */}
                  {activeAgenda.length > 0 ? (
                    <section className="rounded-card border border-line bg-surface px-5 pb-3 pt-4 sm:px-6">
                      <DayAxis
                        items={activeAgenda}
                        at={view === 'tomorrow' ? tomorrowStart : now}
                      />
                    </section>
                  ) : null}

                  <section className="rounded-card border border-line bg-surface">
                    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                      <h2 className="text-[16px] font-semibold tracking-tight text-ink">
                        {activeDay ? weekdayLabel[activeDay] : 'No classes'}
                        {view === 'today' ? (
                          <span className="ml-2 text-[12.5px] font-normal text-brand-ink">
                            Today
                          </span>
                        ) : null}
                      </h2>
                      <span className="text-[12.5px] text-ink-subtle">
                        {activeClasses} {activeClasses === 1 ? 'class' : 'classes'}
                      </span>
                    </div>

                    <div className="py-2 pr-2">
                      {activeAgenda.length === 0 ? (
                        <p className="px-5 py-12 text-center text-[14px] text-ink-muted">
                          {activeDay
                            ? `Nothing scheduled on ${weekdayLabel[activeDay]}.`
                            : 'Nothing scheduled — the teaching week runs Monday to Saturday.'}
                        </p>
                      ) : (
                        <TodayTimeline items={activeAgenda} />
                      )}
                    </div>
                  </section>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </PageContainer>
  )
}

/** The full teaching week, for the days a student is planning rather than living. */
function WeekGrid({
  sessions,
  today,
}: {
  sessions: ReturnType<typeof withStatus>
  today: Weekday | null
}) {
  return (
    <section>
      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <div className="grid min-w-[720px] grid-cols-6 gap-px bg-line">
          {weekdays.map((day) => {
            const dayClasses = sessionsForDay(sessions, day)
            return (
              <div key={day} className="bg-surface">
                <div
                  className={cn(
                    'border-b border-line px-3 py-2.5 text-center text-[12.5px] font-medium',
                    day === today ? 'text-brand-ink' : 'text-ink-muted',
                  )}
                >
                  {weekdayLabel[day]}
                  {day === today ? (
                    <span aria-hidden className="mx-auto mt-1 block size-1 rounded-full bg-brand" />
                  ) : null}
                </div>

                <div className="space-y-1.5 p-2">
                  {dayClasses.length === 0 ? (
                    <p className="px-1 py-4 text-center text-[11px] text-ink-subtle">—</p>
                  ) : (
                    dayClasses.map((session) => {
                      const course = courseById.get(session.courseId)
                      const running = session.status === 'ongoing'
                      return (
                        <div
                          key={session.id}
                          className={cn(
                            'rounded-tile border px-2.5 py-2 transition-colors',
                            running
                              ? 'border-brand-border/50 bg-brand-soft'
                              : session.status === 'completed'
                                ? 'border-line bg-surface-raised opacity-55'
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
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
