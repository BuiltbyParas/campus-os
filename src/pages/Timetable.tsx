import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, Clock3, MapPin, ScanLine, User } from 'lucide-react'
import { useState } from 'react'

import { DayAxis } from '@/components/app/DayAxis'
import { NextClassHero } from '@/components/app/NextClassHero'
import { TodayTimeline } from '@/components/app/TodayTimeline'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { useSwipeViews } from '@/hooks/useSwipeViews'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ButtonLink } from '@/components/ui/Button'
import { DemoNote } from '@/components/ui/DemoTag'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { ErrorState } from '@/components/ui/States'
import { courseById, weekdayLabel, weekdays } from '@/data'
import { buildDayAgenda } from '@/lib/agenda'
import { easeOutSoft } from '@/lib/motion'
import { haptic } from '@/lib/haptics'
import { cn, formatTime } from '@/lib/utils'
import { sessionsForDay, weekdayFromDate, withStatus } from '@/services/academics'
import { useAttendance, useDeadlines, useEvents, useTimetable } from '@/services/queries'
import { toLocalIsoDate } from '@/data'
import type { ClassSession, Weekday } from '@/types'

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
  const [openSession, setOpenSession] = useState<ClassSession | null>(null)
  const swipeRef = useSwipeViews<View>({
    values: ['today', 'tomorrow', 'week'],
    value: view,
    onChange: setView,
  })

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
          <div className="card-premium p-5">
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
          {today ? (
            <NextClassHero
              now={currentItem}
              next={nextItem}
              sessionsToday={sessionsForDay(sessions, today).length}
              hideWeekLink
            />
          ) : null}

          <div ref={swipeRef} className="space-y-5">
          <Tabs options={options} value={view} onChange={setView} label="Schedule view" />

          {/* The segmented control names the views; the swipe moves between
              them, which is how a phone expects sibling views to behave. */}
          <p className="text-center text-[11.5px] text-ink-faint md:hidden">
            Swipe to move between today, tomorrow and the week
          </p>

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
                <WeekGrid sessions={sessions} today={today} onSelect={setOpenSession} />
              ) : (
                <>
                  {/* the shape of the day, with the live position marked */}
                  {activeAgenda.length > 0 ? (
                    <section className="card-premium px-5 pb-3 pt-4 sm:px-6">
                      <DayAxis
                        items={activeAgenda}
                        at={view === 'tomorrow' ? tomorrowStart : now}
                      />
                    </section>
                  ) : null}

                  <section className="card-premium">
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
          </div>

          <ClassSheet session={openSession} onClose={() => setOpenSession(null)} />
        </>
      )}
    </PageContainer>
  )
}

/**
 * The full teaching week, for the days a student is planning rather than living.
 *
 * Two renderings of one week, because a six-column grid and a phone are not
 * compatible: at 390px that grid is 720px wide, so Thursday to Saturday sit
 * off-screen behind a horizontal scroll with no affordance pointing at them —
 * the week appears to be three days long. Below `md` the same sessions are
 * stacked as a day-by-day list instead, which carries every day and every
 * class without asking anyone to scroll sideways.
 */
function WeekGrid({
  sessions,
  today,
  onSelect,
}: {
  sessions: ReturnType<typeof withStatus>
  today: Weekday | null
  /** Opens the detail sheet. Phone only — the grid has room to show more. */
  onSelect: (session: ClassSession) => void
}) {
  return (
    <section>
      {/* ---------------------------------------------------- phones: a list */}
      <div className="space-y-3 md:hidden">
        {weekdays.map((day) => {
          const dayClasses = sessionsForDay(sessions, day)
          const isToday = day === today
          return (
            <div
              key={day}
              className={cn(
                'card-premium overflow-hidden',
                isToday && 'border-brand-border shadow-[var(--shadow-xs),var(--glow-xs)]',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-between gap-3 border-b border-line px-4 py-3',
                  isToday && 'bg-brand-soft',
                )}
              >
                <h3
                  className={cn(
                    'flex items-center gap-2 text-[15px] font-bold',
                    isToday ? 'text-brand-ink' : 'text-ink',
                  )}
                >
                  {weekdayLabel[day]}
                  {isToday ? (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-on-brand">
                      Today
                    </span>
                  ) : null}
                </h3>
                <span className="shrink-0 text-[12.5px] text-ink-subtle">
                  {dayClasses.length === 0
                    ? 'No classes'
                    : `${dayClasses.length} ${dayClasses.length === 1 ? 'class' : 'classes'}`}
                </span>
              </div>

              {dayClasses.length === 0 ? (
                <p className="px-4 py-5 text-[13.5px] text-ink-subtle">
                  Nothing scheduled — a clear day.
                </p>
              ) : (
                <ul className="divide-y divide-divider">
                  {dayClasses.map((session) => {
                    const course = courseById.get(session.courseId)
                    const running = session.status === 'ongoing'
                    return (
                      <li key={session.id}>
                      <button
                        type="button"
                        onClick={() => {
                          haptic('tick')
                          onSelect(session)
                        }}
                        className={cn(
                          'flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition-colors active:bg-brand-soft',
                          running && 'bg-brand-soft',
                          session.status === 'completed' && 'opacity-55',
                        )}
                      >
                        <span className="w-[60px] shrink-0 pt-0.5 text-[12.5px] font-semibold tabular-nums text-brand-ink">
                          {formatTime(session.startTime)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-[14.5px] font-medium text-ink">
                              {course?.name ?? course?.short ?? 'Class'}
                            </span>
                            {running ? (
                              <span className="shrink-0 rounded-full bg-ok-soft px-2 py-0.5 text-[10px] font-bold uppercase text-ok-ink">
                                Now
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-[12.5px] text-ink-subtle">
                            {session.block} · {session.room}
                          </span>
                        </span>
                        <ChevronRight className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-hidden />
                      </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* ------------------------------------------------- desktop: the grid */}
      <div className="hidden overflow-x-auto card-premium md:block">
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

/**
 * One class, in full.
 *
 * A row in a timetable can only carry a time and a room; everything else about
 * a session — who teaches it, what kind it is, how attendance in that course
 * stands — needs somewhere to go. On a phone that somewhere is a sheet you
 * pull up and flick away, which is cheaper than a navigation and keeps the
 * week you were reading underneath.
 */
function ClassSheet({
  session,
  onClose,
}: {
  session: ClassSession | null
  onClose: () => void
}) {
  const attendance = useAttendance()
  const course = session ? courseById.get(session.courseId) : undefined
  const record = attendance.data?.courses.find((entry) => entry.courseId === session?.courseId)

  return (
    <Modal open={Boolean(session)} onClose={onClose} size="sm">
      {session ? (
        <>
          <p className="text-[11px] font-bold uppercase tracking-[1px] text-ink-faint">
            {weekdayLabel[session.day]} · {session.kind}
          </p>
          <h2 className="mt-1.5 text-[24px] font-bold tracking-[-0.02em] text-ink">
            {course?.name ?? 'Class'}
          </h2>
          <p className="mt-1 text-[13px] text-ink-subtle">{course?.code}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3">
            {[
              { icon: Clock3, label: 'Time', value: `${formatTime(session.startTime)} – ${formatTime(session.endTime)}` },
              { icon: MapPin, label: 'Where', value: `${session.block} · ${session.room}` },
              { icon: User, label: 'Taught by', value: session.faculty },
              {
                icon: ScanLine,
                label: 'Your attendance',
                value: record ? `${Math.round(record.percentage)}%` : 'Not recorded',
                tone: record && record.status === 'below' ? 'text-danger-ink' : undefined,
              },
            ].map((row) => (
              <div key={row.label} className="rounded-tile border border-line bg-field-raised p-3">
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-ink-faint">
                  <row.icon className="size-3.5" aria-hidden />
                  {row.label}
                </dt>
                <dd className={cn('mt-1 text-[14px] font-semibold text-ink', row.tone)}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {session.note ? (
            <p className="mt-4 rounded-tile border border-warn/25 bg-warn-soft px-3.5 py-3 text-[13px] text-warn-ink">
              {session.note}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <ButtonLink to="/app/attendance" variant="secondary" size="md" block>
              View attendance
            </ButtonLink>
            <ButtonLink
              to={`/app/assistant?q=${encodeURIComponent(`Can I skip my next ${course?.short ?? ''} class?`)}`}
              variant="primary"
              size="md"
              block
            >
              Ask CampusOS
            </ButtonLink>
          </div>

          <DemoNote className="mt-4" />
        </>
      ) : null}
    </Modal>
  )
}
