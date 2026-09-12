import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
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
    <section className="group relative min-h-[200px] overflow-hidden rounded-card border-[1.5px] border-line bg-[linear-gradient(135deg,var(--surface)_0%,var(--canvas)_100%)] p-7 elev-2 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.2,0.9,0.1,1)] hover:-translate-y-3 hover:border-line-strong hover:shadow-[var(--shadow-md),var(--glow-m)] sm:p-8">
      {/* A very slow wash across the surface. At 45s it is below the threshold
          of notice on a glance and only reads over a long look — depth rather
          than animation. */}
      <span
        aria-hidden
        className="grad-glass grad-drift pointer-events-none absolute inset-0 opacity-80"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-brand/25 blur-[80px] transition-opacity duration-500 group-hover:opacity-150"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[32px]">
            {greeting(at)}, {name}
          </h1>
          <p className="mt-2 text-[14px] tracking-[0.5px] text-ink-subtle">
            {at.toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {' · '}
            {at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>

        {untilNext === undefined || untilNext <= 0 ? (
          /* The day being over is information too. Without this the card is
             two thirds empty every evening, which reads as something failing
             to load rather than as nothing being left to do. */
          <div className="flex shrink-0 items-center gap-3 rounded-tile border border-ok/25 bg-ok-soft px-4 py-3">
            <CheckCircle2 className="size-5 shrink-0 text-ok-ink" aria-hidden />
            <span>
              <span className="block text-[14px] font-bold text-ok-ink">Day complete</span>
              <span className="block text-[12.5px] text-ink-subtle">
                Nothing else scheduled today
              </span>
            </span>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-3">
            <span className="grid size-11 place-items-center rounded-tile border border-brand-border bg-brand-soft">
              <Clock3 className="size-5 text-brand-ink" aria-hidden />
            </span>
            <span className="text-right">
              <span className="grad-text block text-[28px] font-bold leading-none tabular-nums">
                {countdown(untilNext).replace('in ', '')}
              </span>
              <span className="mt-1 block text-[13px] text-ink-subtle">
                until {view?.next?.title ?? 'your next class'}
              </span>
            </span>
          </div>
        )}
      </div>

      {summary ? (
        <p className="relative mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-subtle">
          {summary.map((part, index) => (
            <span key={part} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden className="size-1 rounded-full bg-ink-faint" />
              ) : null}
              {part}
            </span>
          ))}
        </p>
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
  return parts
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
  ink: 'bg-brand-soft text-brand-ink group-hover:shadow-[var(--glow-xs)]',
  ok: 'bg-ok-soft text-ok-ink group-hover:shadow-[0_0_14px_rgb(16_185_129_/_0.35)]',
  warn: 'bg-warn-soft text-warn-ink group-hover:shadow-[0_0_14px_rgb(245_158_11_/_0.35)]',
  danger: 'bg-danger-soft text-danger-ink group-hover:shadow-[0_0_14px_rgb(239_68_68_/_0.35)]',
} as const

const statRail = {
  ink: 'grad-accent',
  ok: 'grad-success',
  warn: 'grad-warning',
  danger: 'bg-[linear-gradient(135deg,#ef4444,#f97316)]',
} as const

/** The ambient wash a card gains on hover, matched to what the figure means. */
const statGlow = {
  ink: 'bg-brand',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
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
        'card-premium card-interactive group relative flex min-h-[160px] flex-col overflow-hidden p-5',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-12 -top-16 size-40 rounded-full opacity-0 blur-[60px] transition-opacity duration-250 group-hover:opacity-40',
          statGlow[stat.tone],
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-tile transition-[transform,box-shadow] duration-250 group-hover:scale-120',
            statChip[stat.tone],
          )}
        >
          <stat.icon className="size-5" aria-hidden />
        </span>
        <p className="line-clamp-2 text-right text-[11px] font-bold uppercase leading-tight tracking-[0.5px] text-ink-faint sm:line-clamp-1">
          {stat.label}
        </p>
      </div>

      <p
        className={cn(
          'relative mt-auto pt-5 text-[36px] font-bold leading-none tracking-[-0.02em] tabular-nums transition-[color,text-shadow] duration-250',
          statTone[stat.tone],
          'group-hover:[text-shadow:0_0_18px_currentColor]',
        )}
      >
        {stat.value}
      </p>

      {stat.detail ? (
        <p className="relative mt-2 line-clamp-2 text-[13px] leading-snug text-ink-subtle sm:line-clamp-1">
          {stat.detail}
        </p>
      ) : null}

      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100',
          statRail[stat.tone],
        )}
      />
    </Link>
  )
}
