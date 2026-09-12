import {
  Armchair,
  CalendarDays,
  FileText,
  MessageSquareWarning,
  ScanLine,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Skeleton } from '@/components/ui/Skeleton'
import { courseById } from '@/data'
import { formatMoney } from '@/lib/fees'
import { cn, daysUntil, formatTime } from '@/lib/utils'
import type { TodayView } from '@/services/today'
import type { SignalTone } from '@/types'

interface ContextRow {
  id: string
  icon: LucideIcon
  label: string
  value: string
  detail?: string
  to: string
  tone?: SignalTone
}

const toneValue: Record<SignalTone, string> = {
  info: 'text-ink',
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  danger: 'text-danger-ink',
}

/**
 * What the assistant can see.
 *
 * The difference between a chatbot and an operating layer is whether the
 * student can tell what it is reading *before* they ask. This rail makes the
 * retrieval visible: every row is a record the assistant will pull from, with
 * the live figure already on it, linking to the screen it came from.
 *
 * It is built from the same `TodayView` the dashboard renders, so the context
 * shown here cannot disagree with the answer that follows.
 */
export function AssistantContext({
  view,
  isPending,
  className,
}: {
  view: TodayView
  isPending?: boolean
  className?: string
}) {
  const rows = buildRows(view)

  return (
    <aside className={cn('min-w-0', className)}>
      <div className="card-premium p-4">
        <div className="flex items-center gap-2">
          <span aria-hidden className="relative flex size-1.5">
            <span className="absolute inline-flex size-full rounded-full bg-ok opacity-60 [animation:pulse-ring_2.4s_ease-out_infinite]" />
            <span className="relative inline-flex size-1.5 rounded-full bg-ok" />
          </span>
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            Connected records
          </h2>
        </div>

        {isPending ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full rounded-tile" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-3 text-[12.5px] leading-snug text-ink-muted">
            No campus records are loaded yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-0.5">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  to={row.to}
                  className="group flex items-center gap-2.5 rounded-tile px-2.5 py-2.5 transition-colors duration-200 hover:bg-surface-raised"
                >
                  <row.icon
                    className="size-3.5 shrink-0 text-ink-subtle transition-[color,transform] duration-200 group-hover:scale-110 group-hover:text-brand-ink"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] text-ink-subtle">{row.label}</span>
                    {row.detail ? (
                      <span className="block truncate text-[11px] text-ink-subtle/80">
                        {row.detail}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 text-[14px] font-semibold tabular-nums transition-colors duration-200 group-hover:text-brand-ink',
                      toneValue[row.tone ?? 'info'],
                    )}
                  >
                    {row.value}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 border-t border-line pt-3 text-[11px] leading-snug text-ink-subtle">
          Answers are computed from these records. Demo rules are labelled wherever they appear.
        </p>
      </div>
    </aside>
  )
}

/**
 * Only rows that actually have something behind them.
 *
 * A rail advertising "Fees —" with no figure would be worse than one row
 * shorter: it claims a connection the assistant cannot currently use.
 */
function buildRows(view: TodayView): ContextRow[] {
  const rows: ContextRow[] = []
  const classCount = view.todaySessions.length

  rows.push({
    id: 'today',
    icon: CalendarDays,
    label: 'Today',
    detail: view.next ? `Next at ${formatTime(view.next.startTime)}` : 'Nothing left today',
    value: `${classCount}`,
    to: '/app/timetable',
  })

  if (view.attendance) {
    const weakest = view.weakestCourse
    rows.push({
      id: 'attendance',
      icon: ScanLine,
      label: 'Attendance',
      detail: weakest
        ? `Lowest ${courseById.get(weakest.courseId)?.short ?? '—'} ${Math.round(weakest.percentage)}%`
        : undefined,
      value: `${Math.round(view.attendance.overallPercentage)}%`,
      tone: view.attendance.status === 'below' ? 'danger' : 'info',
      to: '/app/attendance',
    })
  }

  const pendingDeadlines = view.agenda.filter((item) => item.kind === 'deadline').length
  if (pendingDeadlines > 0) {
    rows.push({
      id: 'coursework',
      icon: FileText,
      label: 'Due today',
      value: String(pendingDeadlines),
      tone: 'warn',
      to: '/app/timetable',
    })
  }

  if (view.exams?.next) {
    const days = daysUntil(view.exams.next.date)
    const course = courseById.get(view.exams.next.courseId)
    rows.push({
      id: 'exam',
      icon: Armchair,
      label: 'Next exam',
      detail: course?.short,
      value: days === 0 ? 'Today' : `${days}d`,
      tone: days <= 1 ? 'danger' : days <= 7 ? 'warn' : 'info',
      to: '/app/exams',
    })
  }

  rows.push({
    id: 'requests',
    icon: MessageSquareWarning,
    label: 'Open requests',
    detail: view.openRequests[0]?.reference,
    value: String(view.openRequests.length),
    to: '/app/complaints',
  })

  if (view.fees?.nextDue) {
    const days = daysUntil(view.fees.nextDue.dueDate)
    rows.push({
      id: 'fees',
      icon: Wallet,
      label: 'Fees due',
      detail: days < 0 ? 'Overdue' : `in ${days} days`,
      value: formatMoney(view.fees.nextDue.amount, view.fees.currency),
      tone: days < 0 ? 'danger' : days <= 7 ? 'warn' : 'info',
      to: '/app/fees',
    })
  }

  return rows
}
