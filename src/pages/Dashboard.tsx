import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CalendarRange,
  MessageSquareWarning,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { AttendanceRow } from '@/components/app/AttendanceRow'
import { AttendanceStrip } from '@/components/app/AttendanceStrip'
import { NextClass } from '@/components/app/NextClass'
import { SessionRow } from '@/components/app/SessionRow'
import { PageContainer } from '@/components/layout/PageContainer'
import { DemoTag } from '@/components/ui/DemoTag'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { assistantSuggestions, stageShortLabel } from '@/data'
import { attendanceStatusTone } from '@/lib/attendance'
import { cn, formatRelative, greeting } from '@/lib/utils'
import {
  findNextSession,
  sessionsForDay,
  weekdayFromDate,
  withStatus,
} from '@/services/academics'
import { useAttendance, useComplaints, useNotifications, useTimetable } from '@/services/queries'

function firstName(name: string) {
  return name.split(' ')[0]
}

function minutesBetween(startTime: string, at: Date) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const start = new Date(at)
  start.setHours(hours, minutes, 0, 0)
  return (start.getTime() - at.getTime()) / 60_000
}

/* --------------------------------------------------------------- sections */

/** Four destinations a student reaches for most often. */
const quickActions = [
  { to: '/app/complaints/new', label: 'Report an issue', icon: MessageSquareWarning },
  { to: '/app/attendance', label: 'Attendance', icon: ScanLine },
  { to: '/app/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/app/events', label: 'Events', icon: CalendarRange },
]

function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode
  action?: { label: string; to: string }
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="text-[17px] font-semibold tracking-tight text-ink">{children}</h2>
      {action ? (
        <Link
          to={action.to}
          className="shrink-0 text-[13px] font-medium text-brand-ink transition-colors hover:text-ink"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}

export default function Dashboard() {
  const { student, readNotificationIds } = useStore()

  const timetable = useTimetable()
  const attendance = useAttendance()
  const complaints = useComplaints({ status: 'open' })
  const notifications = useNotifications()

  const now = new Date()
  const today = weekdayFromDate(now)

  const sessions = withStatus(timetable.data ?? [], now)
  const todaySessions = today ? sessionsForDay(sessions, today) : []
  const next = findNextSession(sessions, now)

  const summary = attendance.data
  const weakest = summary
    ? [...summary.courses].sort((a, b) => a.percentage - b.percentage)[0]
    : undefined

  const unread = (notifications.data ?? []).filter(
    (item) => !item.read && !readNotificationIds.includes(item.id),
  )

  return (
    <PageContainer className="space-y-7">
      {/* ------------------------------------------------------------ header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-ink-subtle">
            {now.toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink sm:text-[32px]">
            {greeting(now)}, {firstName(student.name)}
          </h1>
        </div>

        <Link
          to="/app/notifications"
          className="press hidden items-center gap-2 rounded-control border border-line bg-surface px-3.5 py-2.5 text-[13.5px] font-medium text-ink-muted hover:border-line-strong hover:text-ink lg:inline-flex"
        >
          <Bell className="size-4" aria-hidden />
          {unread.length > 0 ? `${unread.length} new` : 'Notifications'}
          {unread.length > 0 ? (
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          ) : null}
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr] lg:gap-6">
        {/* ------------------------------------------------------ left column */}
        {/* min-w-0: grid items default to min-width:auto, which would let a wide
            row (a class with a long faculty name) push the whole column past the
            viewport on a narrow screen. */}
        <div className="min-w-0 space-y-5 lg:space-y-6">
          {timetable.isPending ? (
            <Skeleton className="h-[232px] w-full rounded-card" />
          ) : timetable.isError ? (
            <ErrorState onRetry={() => timetable.refetch()} />
          ) : next ? (
            <NextClass
              session={next.session}
              day={next.day}
              isToday={next.isToday}
              minutesUntil={minutesBetween(next.session.startTime, now)}
            />
          ) : (
            <section className="rounded-card border border-line bg-surface p-6">
              <h2 className="text-[17px] font-semibold text-ink">No classes scheduled</h2>
              <p className="mt-1.5 text-[14px] text-ink-muted">
                Your timetable is clear for the rest of the week.
              </p>
            </section>
          )}

          {summary ? <AttendanceStrip summary={summary} className="lg:hidden" /> : null}

          {/* today's schedule */}
          <section>
            <SectionTitle action={{ label: 'Full week', to: '/app/timetable' }}>
              Today’s classes
            </SectionTitle>
            <div className="rounded-card border border-line bg-surface p-2">
              {timetable.isPending ? (
                <SkeletonRows className="p-3" />
              ) : todaySessions.length === 0 ? (
                <p className="px-3 py-8 text-center text-[13.5px] text-ink-muted">
                  Nothing scheduled today.
                </p>
              ) : (
                <ul>
                  {todaySessions.map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      isNext={session.id === next?.session.id}
                    />
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* open requests */}
          <section>
            <SectionTitle action={{ label: 'All requests', to: '/app/complaints' }}>
              Open requests
            </SectionTitle>

            {complaints.isPending ? (
              <div className="rounded-card border border-line bg-surface p-5">
                <SkeletonRows count={2} />
              </div>
            ) : (complaints.data ?? []).length === 0 ? (
              <div className="rounded-card border border-dashed border-line bg-surface/50 px-5 py-8 text-center">
                <p className="text-[14px] font-medium text-ink">Nothing outstanding</p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Anything you report will show up here with its status.
                </p>
                <Link
                  to="/app/complaints/new"
                  className="mt-4 inline-flex text-[13px] font-medium text-brand-ink hover:text-ink"
                >
                  Report an issue
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
                {(complaints.data ?? []).slice(0, 3).map((complaint) => {
                  const lastEntry = complaint.timeline[complaint.timeline.length - 1]
                  return (
                    <li key={complaint.id}>
                      <Link
                        to={`/app/complaints/${complaint.id}`}
                        className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-raised"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            'mt-1.5 size-1.5 shrink-0 rounded-full',
                            complaint.stage === 'verification' ? 'bg-warn' : 'bg-brand',
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-ink">
                            {complaint.title}
                          </p>
                          <p className="mt-0.5 truncate text-[12.5px] text-ink-subtle">
                            {complaint.reference} · {stageShortLabel[complaint.stage]} ·{' '}
                            {formatRelative(lastEntry.timestamp)}
                          </p>
                        </div>
                        <ArrowUpRight
                          className="mt-0.5 size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* quick actions — left column keeps the two columns in balance */}
          <section>
            <SectionTitle>Quick actions</SectionTitle>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="press flex flex-col gap-2.5 rounded-tile border border-line bg-surface p-3.5 hover:border-line-strong"
                >
                  <action.icon className="size-[18px] text-ink-subtle" aria-hidden />
                  <span className="text-[13px] font-medium text-ink">{action.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ----------------------------------------------------- right column */}
        <div className="min-w-0 space-y-5 lg:space-y-6">
          {/* attendance — the strip above replaces this below `lg` */}
          <section className="hidden rounded-card border border-line bg-surface p-5 lg:block">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-semibold tracking-tight text-ink">Attendance</h2>
              {summary?.source === 'demo' ? <DemoTag /> : null}
            </div>

            {attendance.isPending ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <Skeleton className="size-[132px] rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : attendance.isError || !summary ? (
              <ErrorState onRetry={() => attendance.refetch()} />
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <ProgressRing
                    value={summary.overallPercentage}
                    threshold={summary.requiredPercentage}
                    tone={attendanceStatusTone[summary.status]}
                    label="Overall attendance"
                    caption={`${summary.requiredPercentage}% required`}
                  />
                  <p className="mt-3 text-center text-[13px] text-ink-muted">
                    {summary.totalAttended} of {summary.totalHeld} classes attended
                  </p>
                </div>

                {weakest ? (
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.1em] text-ink-subtle">
                      Needs attention
                    </p>
                    <AttendanceRow attendance={weakest} className="pb-0" />
                  </div>
                ) : null}

                <Link
                  to="/app/attendance"
                  className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink transition-colors hover:text-ink"
                >
                  View all courses
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </>
            )}
          </section>

          {/* assistant entry point — a floating control, so it gets the glass */}
          <GlassPanel className="rounded-card p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-[18px] text-brand-ink" aria-hidden />
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">AI Assistant</h2>
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
              Ask about your attendance, timetable or open requests — answers come from your own
              campus records.
            </p>

            <ul className="mt-4 space-y-2">
              {assistantSuggestions.slice(0, 2).map((suggestion) => (
                <li key={suggestion}>
                  <Link
                    to={`/app/assistant?q=${encodeURIComponent(suggestion)}`}
                    className="press block rounded-control border border-line bg-surface/50 px-3 py-2.5 text-left text-[13px] text-ink-muted hover:border-line-strong hover:text-ink"
                  >
                    {suggestion}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              to="/app/assistant"
              className="press mt-4 inline-flex h-10 w-full items-center justify-center rounded-control bg-brand text-[14px] font-medium text-on-brand hover:bg-brand-hover"
            >
              Open assistant
            </Link>
          </GlassPanel>

        </div>
      </div>
    </PageContainer>
  )
}
