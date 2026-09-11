import { ArrowUpRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { AttendanceStrip } from '@/components/app/AttendanceStrip'
import { CampusPulse } from '@/components/app/CampusPulse'
import { InsightRow } from '@/components/app/InsightRow'
import { NowNext } from '@/components/app/NowNext'
import { SignalStack } from '@/components/app/SignalStack'
import { SmartActions } from '@/components/app/SmartActions'
import { TodayTimeline } from '@/components/app/TodayTimeline'
import { PageContainer } from '@/components/layout/PageContainer'
import { DemoTag } from '@/components/ui/DemoTag'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { assistantSuggestions, courseById, stageShortLabel, toLocalIsoDate } from '@/data'
import { buildDayAgenda } from '@/lib/agenda'
import { attendanceStatusTone } from '@/lib/attendance'
import { cn, formatRelative, greeting } from '@/lib/utils'
import { sessionsForDay, weekdayFromDate, withStatus } from '@/services/academics'
import { useAnnouncements, useCampusContext, useEvents } from '@/services/queries'
import { buildInsights, buildPulse, buildSignals, buildSmartActions } from '@/services/signals'

function firstName(name: string) {
  return name.split(' ')[0]
}

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

/**
 * Today.
 *
 * Ordered by urgency, not by department. The screen reads top to bottom as:
 * where you have to be → what needs you → the shape of your day → what CampusOS
 * can do → what is coming → your own figures.
 *
 * Only the first two blocks are visually dominant. Everything below is quieter
 * on purpose: a dashboard where eight sections shout equally is a menu.
 */
export default function Dashboard() {
  const { student } = useStore()
  const { attendance, timetable, complaints, deadlines, isPending } = useCampusContext()
  const events = useEvents()
  const announcements = useAnnouncements()

  const now = new Date()
  const today = weekdayFromDate(now)
  const isoToday = toLocalIsoDate(now)

  const sessions = withStatus(timetable.data ?? [], now)
  const todaySessions = today ? sessionsForDay(sessions, today) : []

  const agenda = buildDayAgenda({
    sessions: todaySessions,
    deadlines: deadlines.data ?? [],
    events: events.data ?? [],
    isoDate: isoToday,
    at: now,
  })

  /* Now/Next read from the same agenda as the timeline, so they cannot
     disagree with the list directly beneath them. */
  const currentItem = agenda.find((item) => item.status === 'now')
  const nextItem = agenda.find((item) => item.status === 'next')

  const context = {
    attendance: attendance.data,
    sessions,
    complaints: complaints.data ?? [],
    deadlines: deadlines.data ?? [],
    at: now,
  }

  const signals = buildSignals(context)
  const smartActions = buildSmartActions(context)
  const insights = buildInsights(context)
  const pulse = buildPulse({
    deadlines: deadlines.data ?? [],
    events: events.data ?? [],
    notices: announcements.data ?? [],
    at: now,
  })

  const summary = attendance.data
  const weakest = summary
    ? [...summary.courses].sort((a, b) => a.percentage - b.percentage)[0]
    : undefined

  const openRequests = (complaints.data ?? []).filter((item) => item.stage !== 'resolved')

  return (
    <PageContainer className="space-y-6">
      {/* ------------------------------------------------------------ header */}
      <header>
        <p className="text-[13px] font-medium text-ink-subtle">
          {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink sm:text-[32px]">
          {greeting(now)}, {firstName(student.name)}
        </h1>
      </header>

      {/* --------------------------------------------------------- now / next */}
      {timetable.isPending ? (
        <Skeleton className="h-[196px] w-full rounded-card" />
      ) : timetable.isError ? (
        <ErrorState onRetry={() => timetable.refetch()} />
      ) : (
        <NowNext now={currentItem} next={nextItem} />
      )}

      {/* ------------------------------------------------------ smart actions */}
      {!isPending ? <SmartActions actions={smartActions.slice(0, 4)} /> : null}

      {/* ----------------------------------------------------------- signals */}
      <section>
        <SectionTitle>Needs attention</SectionTitle>
        {isPending ? (
          <Skeleton className="h-[76px] w-full rounded-card" />
        ) : (
          <SignalStack signals={signals} />
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr] lg:gap-6">
        {/* --------------------------------------------------------- your day */}
        <div className="min-w-0 space-y-5 lg:space-y-6">
          {summary ? <AttendanceStrip summary={summary} className="lg:hidden" /> : null}

          <section>
            <SectionTitle action={{ label: 'Full week', to: '/app/timetable' }}>
              Your day
            </SectionTitle>
            <div className="rounded-card border border-line bg-surface py-2 pr-2">
              {timetable.isPending ? (
                <SkeletonRows className="p-4" />
              ) : (
                <TodayTimeline items={agenda} />
              )}
            </div>
          </section>

          <section>
            <SectionTitle action={{ label: 'All requests', to: '/app/complaints' }}>
              Recent activity
            </SectionTitle>
            {complaints.isPending ? (
              <div className="rounded-card border border-line bg-surface p-5">
                <SkeletonRows count={2} />
              </div>
            ) : openRequests.length === 0 ? (
              <div className="rounded-card border border-dashed border-line bg-surface/50 px-5 py-8 text-center">
                <p className="text-[14px] font-medium text-ink">Nothing outstanding</p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Anything you report shows up here with its status.
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
                {openRequests.slice(0, 3).map((complaint) => {
                  const last = complaint.timeline[complaint.timeline.length - 1]
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
                            {formatRelative(last.timestamp)}
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
        </div>

        {/* ------------------------------------------------------- right rail */}
        <div className="min-w-0 space-y-5 lg:space-y-6">
          {/* assistant — a floating control, so it earns the glass */}
          <GlassPanel className="rounded-card p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-[18px] text-brand-ink" aria-hidden />
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">Ask CampusOS</h2>
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
              It reads your timetable, attendance and requests before answering — and shows you
              which records it used.
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
                    <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-ink-subtle">
                      Weakest course
                    </p>
                    <p className="mt-2 truncate text-[14px] font-medium text-ink">
                      {courseById.get(weakest.courseId)?.name ?? 'Course'}
                    </p>
                    <p className="mt-0.5 text-[13px] tabular-nums text-ink-muted">
                      {Math.round(weakest.percentage)}% · {weakest.attended} of {weakest.held}{' '}
                      attended
                    </p>
                    <p className="mt-1.5 text-[12.5px] text-ink-muted">
                      {weakest.status === 'below'
                        ? `Attend the next ${weakest.mustAttend} to reach ${weakest.requiredPercentage}%`
                        : `You can miss ${weakest.canMiss} more`}
                    </p>
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
        </div>
      </div>

      {/* ------------------------------------------------------- campus pulse */}
      <section>
        <SectionTitle action={{ label: 'Events', to: '/app/events' }}>Campus pulse</SectionTitle>
        {isPending ? (
          <Skeleton className="h-[180px] w-full rounded-card" />
        ) : (
          <CampusPulse items={pulse.slice(0, 5)} />
        )}
      </section>

      {/* ---------------------------------------------------------- insights */}
      <section>
        <SectionTitle>At a glance</SectionTitle>
        {isPending ? (
          <Skeleton className="h-[84px] w-full rounded-card" />
        ) : (
          <InsightRow insights={insights} />
        )}
      </section>
    </PageContainer>
  )
}
