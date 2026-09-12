import {
  ArrowUpRight,
  CalendarDays,
  FileClock,
  Inbox,
  TrendingDown,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { courseById } from '@/data'
import { formatMoney } from '@/lib/fees'
import { countdown } from '@/lib/agenda'
import { cn, daysUntil, greeting } from '@/lib/utils'
import type { TodayView } from '@/services/today'

/**
 * The dashboard's headline figures and the chrome around them.
 *
 * Kept out of the page so that what a figure *means* is decided in one place:
 * `buildStats` reads the same `TodayView` the rest of the screen renders, so a
 * stat can never contradict the block beneath it.
 */

export interface DashboardProps {
  view: TodayView
  name: string
  at: Date
  isPending: boolean
}

/** Section heading with an optional trailing link. */
export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode
  action?: { label: string; to: string }
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="text-[17px] font-semibold tracking-tight text-ink">{children}</h2>
      {action ? (
        <Link
          to={action.to}
          className="tap group inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-ink-muted transition-colors hover:text-brand-ink"
        >
          {action.label}
          <ArrowUpRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      ) : null}
    </div>
  )
}

/**
 * The greeting, as a surface rather than a line of text.
 *
 * It carries three things a student wants before anything else: who they are,
 * how long until they have to move, and the shape of the day in one sentence.
 * Putting the countdown here rather than only in the class card means the
 * answer to "do I have time?" is the first thing on the screen.
 */
export function Greeting({
  name,
  at,
  view,
}: {
  name: string
  at: Date
  view?: TodayView
}) {
  const untilNext = view?.next?.minutesUntil
  const summary = view ? buildSummaryLine(view) : null

  return (
    <section className="lift group relative overflow-hidden rounded-card border border-line bg-gradient-to-br from-surface to-surface-raised p-6 sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-brand/12 blur-[80px] transition-opacity duration-300 group-hover:opacity-160"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold leading-[1.1] tracking-[-0.5px] text-ink sm:text-[28px]">
            {greeting(at)}, {name}
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-muted">
            {at.toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {untilNext !== undefined && untilNext > 0 ? (
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-ink-subtle">
              Next class in
            </p>
            <p className="mt-1 text-[20px] font-bold tabular-nums text-brand-ink transition-[color,text-shadow] duration-200 group-hover:text-brand group-hover:[text-shadow:0_0_16px_rgb(99_102_241_/_0.5)]">
              {countdown(untilNext).replace('in ', '')}
            </p>
          </div>
        ) : null}
      </div>

      {summary ? (
        <p className="relative mt-5 text-[13px] text-ink-subtle">{summary}</p>
      ) : null}
    </section>
  )
}

/** The day in one sentence, dot-separated, zero-count clauses dropped. */
function buildSummaryLine(view: TodayView) {
  const parts: string[] = []
  const classes = view.todaySessions.length
  const deadlines = view.agenda.filter((item) => item.kind === 'deadline').length

  parts.push(`${classes} ${classes === 1 ? 'class' : 'classes'} today`)
  if (deadlines > 0) parts.push(`${deadlines} ${deadlines === 1 ? 'deadline' : 'deadlines'}`)
  if (view.weakestCourse) {
    parts.push(
      `${Math.round(view.weakestCourse.percentage)}% ${courseById.get(view.weakestCourse.courseId)?.short ?? ''}`.trim(),
    )
  }
  if (view.openRequests.length > 0) {
    parts.push(
      `${view.openRequests.length} active ${view.openRequests.length === 1 ? 'request' : 'requests'}`,
    )
  }
  return parts.join(' • ')
}

/* ------------------------------------------------------------------ stats */

export interface Stat {
  id: string
  value: string
  label: string
  detail?: string
  to: string
  tone: 'ink' | 'ok' | 'warn' | 'danger'
  icon: LucideIcon
}

const statTone = {
  ink: 'text-ink',
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  danger: 'text-danger-ink',
} as const

const statChip = {
  ink: 'bg-brand-soft text-brand-ink',
  ok: 'bg-ok-soft text-ok-ink',
  warn: 'bg-warn-soft text-warn-ink',
  danger: 'bg-danger-soft text-danger-ink',
} as const

const statRail = {
  ink: 'group-hover:bg-brand',
  ok: 'group-hover:bg-ok',
  warn: 'group-hover:bg-warn',
  danger: 'group-hover:bg-danger',
} as const

/**
 * The four-to-six figures every direction shows, derived once.
 *
 * Counted from the same `TodayView` the rest of the screen renders, so a stat
 * can never contradict the block beneath it.
 */
export function buildStats(view: TodayView): Stat[] {
  const weakest = view.weakestCourse
  const deadlines = view.agenda.filter((item) => item.kind === 'deadline').length

  const stats: Stat[] = [
    {
      id: 'classes',
      value: String(view.todaySessions.length),
      label: 'Classes today',
      detail: describeClasses(view),
      icon: CalendarDays,
      to: '/app/timetable',
      tone: 'ink',
    },
  ]

  if (deadlines > 0) {
    stats.push({
      id: 'deadlines',
      value: String(deadlines),
      label: deadlines === 1 ? 'Deadline today' : 'Deadlines today',
      detail: view.agenda.find((item) => item.kind === 'deadline')?.title,
      icon: FileClock,
      to: '/app/timetable',
      tone: 'warn',
    })
  }

  if (weakest) {
    stats.push({
      id: 'attendance',
      value: `${Math.round(weakest.percentage)}%`,
      label: `${courseById.get(weakest.courseId)?.short ?? 'Lowest'} attendance`,
      detail:
        weakest.status === 'below'
          ? `Below the ${weakest.requiredPercentage}% threshold`
          : 'Close to the line',
      icon: TrendingDown,
      to: '/app/attendance',
      tone: weakest.status === 'below' ? 'danger' : 'warn',
    })
  }

  if (view.exams?.next) {
    const days = daysUntil(view.exams.next.date)
    stats.push({
      id: 'exam',
      value: days === 0 ? 'Today' : `${days}d`,
      label: 'Until exam',
      detail: courseById.get(view.exams.next.courseId)?.name,
      icon: CalendarDays,
      to: '/app/exams',
      tone: days <= 1 ? 'danger' : days <= 7 ? 'warn' : 'ink',
    })
  }

  if (view.fees?.nextDue) {
    stats.push({
      id: 'fees',
      value: formatMoney(view.fees.nextDue.amount, view.fees.currency),
      label: 'Fees due',
      detail: `In ${daysUntil(view.fees.nextDue.dueDate)} days`,
      icon: Wallet,
      to: '/app/fees',
      tone: 'ink',
    })
  }

  stats.push({
    id: 'requests',
    value: String(view.openRequests.length),
    label: 'Active requests',
    detail: view.openRequests.length > 0 ? 'Awaiting responses' : 'Nothing outstanding',
    icon: Inbox,
    to: '/app/complaints',
    tone: view.openRequests.length > 0 ? 'warn' : 'ok',
  })

  return stats
}

/** "Both in the morning" beats "2" repeated back at the student. */
function describeClasses(view: TodayView) {
  const sessions = view.todaySessions
  if (sessions.length === 0) return 'Nothing scheduled'
  const allMorning = sessions.every((session) => Number(session.startTime.slice(0, 2)) < 12)
  if (sessions.length > 1 && allMorning) return 'Both in the morning'
  return `First at ${sessions[0].startTime}`
}

/**
 * One statistic as a card that lifts.
 *
 * The rail along the bottom picks up the stat's own colour on hover — the
 * accent arrives *from* the data rather than being painted on every card the
 * same shade of purple.
 */
export function StatCard({ stat, className }: { stat: Stat; className?: string }) {
  return (
    <Link
      to={stat.to}
      className={cn(
        'lift group relative flex min-h-[140px] flex-col overflow-hidden rounded-card border border-line bg-gradient-to-br from-surface to-surface/60 p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-115',
            statChip[stat.tone],
          )}
        >
          <stat.icon className="size-[18px]" aria-hidden />
        </span>
        <p className="line-clamp-2 text-right text-[11px] font-semibold uppercase tracking-[0.5px] text-ink-subtle sm:line-clamp-1">
          {stat.label}
        </p>
      </div>

      <p
        className={cn(
          'mt-auto pt-4 text-[32px] font-bold leading-none tracking-[-0.5px] tabular-nums transition-[color,text-shadow] duration-200',
          statTone[stat.tone],
          'group-hover:[text-shadow:0_0_14px_currentColor]',
        )}
      >
        {stat.value}
      </p>
      {stat.detail ? (
        <p className="mt-2 line-clamp-2 text-[13px] text-ink-muted sm:line-clamp-1">{stat.detail}</p>
      ) : null}

      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 bottom-0 h-[2px] bg-transparent transition-colors duration-200',
          statRail[stat.tone],
        )}
      />
    </Link>
  )
}
