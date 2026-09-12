import {
  CalendarDays,
  FileClock,
  GraduationCap,
  ScanLine,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { courseById } from '@/data'
import { countdown } from '@/lib/agenda'
import { formatMoney } from '@/lib/fees'
import { cn, daysUntil } from '@/lib/utils'
import { useToday } from '@/services/queries'

/**
 * The always-visible strip.
 *
 * Five figures a student checks constantly, kept in the chrome so that
 * checking them never costs a navigation. It is sticky under the top bar, and
 * it is deliberately compact: at 40px it is a readout, not a second dashboard.
 *
 * Every value is derived from the same `TodayView` the dashboard renders, so a
 * number up here can never contradict the card below it.
 */

type Tone = 'ink' | 'ok' | 'warn' | 'danger'

const toneText: Record<Tone, string> = {
  ink: 'text-ink',
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  danger: 'text-danger-ink',
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = 'ink',
  trend,
  to,
}: {
  icon: LucideIcon
  label: string
  value: string
  tone?: Tone
  trend?: 'up' | 'down'
  to: string
}) {
  const Trend = trend === 'up' ? TrendingUp : TrendingDown

  return (
    <Link
      to={to}
      title={`${label}: ${value}`}
      className="group flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 transition-colors duration-200 hover:bg-brand-soft"
    >
      <Icon className="size-3.5 shrink-0 text-ink-faint transition-colors group-hover:text-brand-ink" aria-hidden />
      <span className="whitespace-nowrap text-[11.5px] text-ink-subtle">{label}</span>
      <span className={cn('whitespace-nowrap text-[12.5px] font-semibold tabular-nums', toneText[tone])}>
        {value}
      </span>
      {trend ? (
        <Trend
          className={cn('size-3 shrink-0', trend === 'up' ? 'text-ok-ink' : 'text-danger-ink')}
          aria-label={trend === 'up' ? 'trending up' : 'trending down'}
        />
      ) : null}
    </Link>
  )
}

export function QuickStats() {
  const { view, isPending } = useToday(new Date())

  if (isPending) return null

  const weakest = view.weakestCourse
  const nextExam = view.exams?.next
  const deadlines = view.agenda.filter((item) => item.kind === 'deadline').length

  return (
    <div className="sticky top-[72px] z-30 hidden border-b border-divider bg-canvas-2/70 backdrop-blur-md md:block">
      <div className="mx-auto flex h-10 max-w-[1600px] items-center gap-1 overflow-x-auto px-8 scrollbar-none">
        {view.next ? (
          <Stat
            icon={CalendarDays}
            label="Next"
            value={`${view.next.title.split(' ').slice(0, 2).join(' ')} · ${countdown(view.next.minutesUntil ?? 0).replace('in ', '')}`}
            to="/app/timetable"
          />
        ) : (
          <Stat icon={CalendarDays} label="Classes today" value={String(view.todaySessions.length)} to="/app/timetable" />
        )}

        {weakest ? (
          <Stat
            icon={ScanLine}
            label={`${courseById.get(weakest.courseId)?.short ?? 'Lowest'} attendance`}
            value={`${Math.round(weakest.percentage)}%`}
            tone={weakest.status === 'below' ? 'danger' : 'warn'}
            trend={weakest.status === 'below' ? 'down' : undefined}
            to="/app/attendance"
          />
        ) : null}

        {deadlines > 0 ? (
          <Stat icon={FileClock} label="Due today" value={String(deadlines)} tone="warn" to="/app/timetable" />
        ) : null}

        {nextExam ? (
          <Stat
            icon={GraduationCap}
            label="Next exam"
            value={`${daysUntil(nextExam.date)}d`}
            tone={daysUntil(nextExam.date) <= 7 ? 'warn' : 'ink'}
            to="/app/exams"
          />
        ) : null}

        {view.fees?.nextDue ? (
          <Stat
            icon={Wallet}
            label="Fees due"
            value={formatMoney(view.fees.nextDue.amount, view.fees.currency)}
            tone={daysUntil(view.fees.nextDue.dueDate) <= 0 ? 'danger' : 'ink'}
            to="/app/fees"
          />
        ) : null}

        <span className="ml-auto shrink-0 whitespace-nowrap pl-4 text-[10.5px] uppercase tracking-[0.08em] text-ink-faint">
          Demo data
        </span>
      </div>
    </div>
  )
}
