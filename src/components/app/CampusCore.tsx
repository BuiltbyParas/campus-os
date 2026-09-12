import {
  Award,
  CalendarDays,
  CalendarRange,
  MessageSquareWarning,
  ScanLine,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'

import { IntelligenceCore, type CoreNode } from '@/components/core/IntelligenceCore'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { courseById, toLocalIsoDate } from '@/data'
import { countdown, toMinutes } from '@/lib/agenda'
import { formatMoney } from '@/lib/fees'
import { daysUntil, formatTime } from '@/lib/utils'
import type {
  AttendanceSummary,
  CampusEvent,
  ClassSession,
  Complaint,
  EduProgress,
  FeeSummary,
} from '@/types'

/**
 * The CampusOS core, as a working control rather than an illustration.
 *
 * The landing page uses the same object to make an argument; here it does the
 * job the argument promised. Each node carries the live figure CampusOS is
 * currently reading from that service and links straight into it, so the
 * picture of "one context" is literally assembled from the student's records.
 *
 * Nodes are only built for services that returned data. A ring node standing
 * for a service with nothing behind it would be the exact fragmentation this
 * component claims to have solved.
 */

/** Colour and word for a node's state — never colour alone. */
const readoutTone = {
  info: 'text-brand-ink',
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  danger: 'text-danger-ink',
} as const

const stateWord = {
  info: '',
  ok: 'on track',
  warn: 'needs attention',
  danger: 'action needed',
} as const

function buildCoreNodes({
  attendance,
  sessions,
  complaints,
  events,
  fees,
  edu,
  at,
}: {
  attendance?: AttendanceSummary
  /** Today's sessions, already ordered. */
  sessions: ClassSession[]
  complaints: Complaint[]
  events: CampusEvent[]
  fees?: FeeSummary
  edu?: EduProgress
  at: Date
}): CoreNode[] {
  const nodes: CoreNode[] = []
  const nowMinutes = at.getHours() * 60 + at.getMinutes()

  if (attendance) {
    const weakest = [...attendance.courses].sort((a, b) => a.percentage - b.percentage)[0]
    const weakestCourse = weakest ? courseById.get(weakest.courseId) : undefined
    nodes.push({
      id: 'attendance',
      label: 'Attendance',
      icon: ScanLine,
      value: `${Math.round(attendance.overallPercentage)}%`,
      detail: weakest
        ? `Lowest: ${weakestCourse?.short ?? 'a course'} at ${Math.round(weakest.percentage)}%`
        : `${attendance.requiredPercentage}% required`,
      tone:
        attendance.status === 'below' || weakest?.status === 'below'
          ? 'danger'
          : weakest?.status === 'at-risk'
            ? 'warn'
            : 'ok',
      to: '/app/attendance',
      depth: 60,
    })
  }

  const upcoming = sessions.find((session) => toMinutes(session.endTime) > nowMinutes)
  if (upcoming) {
    const course = courseById.get(upcoming.courseId)
    const until = toMinutes(upcoming.startTime) - nowMinutes
    nodes.push({
      id: 'timetable',
      label: 'Timetable',
      icon: CalendarDays,
      value: formatTime(upcoming.startTime),
      detail: `${course?.short ?? 'Class'} · ${upcoming.block} · ${
        until <= 0 ? 'running now' : countdown(until)
      }`,
      /* A class in progress is a live state, one within the half hour is
         something to move for, anything further out is just information. */
      tone: until <= 0 ? 'ok' : until <= 30 ? 'warn' : 'info',
      to: '/app/timetable',
      depth: -40,
    })
  } else {
    nodes.push({
      id: 'timetable',
      label: 'Timetable',
      icon: CalendarDays,
      value: 'Clear',
      detail: 'No classes left today',
      to: '/app/timetable',
      depth: -40,
    })
  }

  /* The soonest event that has not already started. Compared on the local
     calendar date — `toISOString` would roll over at the wrong hour east of
     UTC and drop tonight's event a few hours early. */
  const today = toLocalIsoDate(at)
  const nextEvent = [...events]
    .filter(
      (event) =>
        event.date > today || (event.date === today && toMinutes(event.startTime) > nowMinutes),
    )
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0]
  if (nextEvent) {
    nodes.push({
      id: 'events',
      label: 'Events',
      icon: CalendarRange,
      value: formatTime(nextEvent.startTime),
      detail: `${nextEvent.title} · ${nextEvent.venue}`,
      tone: 'info',
      to: '/app/events',
      depth: 30,
    })
  }

  const open = complaints.filter((complaint) => complaint.stage !== 'resolved')
  const latest = open[0]
  nodes.push({
    id: 'complaints',
    label: 'Complaints',
    icon: MessageSquareWarning,
    value: latest ? latest.reference : 'None open',
    detail: latest ? latest.title : 'Nothing outstanding',
    /* Awaiting the student's confirmation is the only complaint state that
       needs them — everything else is the campus working, not a problem. */
    tone: !latest ? 'ok' : latest.stage === 'verification' ? 'warn' : 'info',
    to: latest ? `/app/complaints/${latest.id}` : '/app/complaints',
    depth: -55,
  })

  if (fees) {
    const next = fees.nextDue
    const days = next ? daysUntil(next.dueDate, at) : 0
    nodes.push({
      id: 'fees',
      label: 'Fees',
      icon: Wallet,
      value: next ? formatMoney(next.amount, fees.currency) : 'Cleared',
      detail: next
        ? `${next.label} · ${days < 0 ? 'overdue' : `due in ${days} ${days === 1 ? 'day' : 'days'}`}`
        : 'Nothing outstanding this semester',
      tone: !next ? 'ok' : days < 0 ? 'danger' : days <= 14 ? 'warn' : 'info',
      to: '/app/fees',
      depth: 52,
    })
  }

  if (edu) {
    nodes.push({
      id: 'edu',
      label: 'EDU-Revolution',
      shortLabel: 'EDU-Rev',
      icon: Award,
      value: `${edu.completed}/${edu.required}`,
      detail: edu.nextRecommended
        ? `Next: ${edu.nextRecommended.title}`
        : 'All activities complete',
      tone: edu.completed >= edu.required ? 'ok' : 'info',
      to: '/app/academics',
      depth: -46,
    })
  }

  nodes.push({
    id: 'assistant',
    label: 'Assistant',
    icon: Sparkles,
    value: 'Ask',
    detail: 'Answers from the records on this ring',
    tone: 'info',
    to: '/app/assistant',
    depth: 45,
  })

  return nodes
}

export function CampusCore({
  attendance,
  sessions,
  complaints,
  events,
  fees,
  edu,
  isPending = false,
  at = new Date(),
  bare = false,
}: {
  attendance?: AttendanceSummary
  sessions: ClassSession[]
  complaints: Complaint[]
  events: CampusEvent[]
  fees?: FeeSummary
  edu?: EduProgress
  isPending?: boolean
  at?: Date
  /**
   * Drop the card chrome and the explanatory column.
   *
   * The command deck composes the core into a larger spatial region, where a
   * bordered panel would reintroduce exactly the rectangle the deck exists to
   * get rid of.
   */
  bare?: boolean
}) {
  const [active, setActive] = useState<CoreNode | null>(null)

  if (isPending && bare) {
    return (
      <div className="mx-auto aspect-square w-full max-w-[340px] animate-pulse rounded-full bg-surface-muted/50" />
    )
  }

  if (isPending) {
    return (
      <div className="card-premium p-6">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="mx-auto aspect-square w-full max-w-[420px] rounded-full" />
        </div>
      </div>
    )
  }

  const nodes = buildCoreNodes({ attendance, sessions, complaints, events, fees, edu, at })
  const alerts = nodes.filter((node) => node.tone === 'warn' || node.tone === 'danger').length

  if (bare) {
    return (
      <div className="min-w-0">
        <IntelligenceCore
          interactive
          nodes={nodes}
          converge={1}
          onActiveChange={setActive}
          className="max-w-[340px] xl:max-w-[380px]"
        />

        {/* The readout sits under the scene rather than beside it, and holds a
            fixed height so hovering a node never reflows the page. */}
        <div className="mx-auto mt-1 min-h-[62px] max-w-[340px] text-center">
          {active ? (
            <>
              <p
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.12em]',
                  readoutTone[active.tone ?? 'info'],
                )}
              >
                {active.label}
                <span className="ml-2 normal-case tracking-normal text-ink-subtle">
                  {stateWord[active.tone ?? 'info']}
                </span>
              </p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">
                {active.value}
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">{active.detail}</p>
            </>
          ) : (
            <p className="text-[12px] leading-snug text-ink-subtle">
              {nodes.length} campus services, read together
              {alerts > 0 ? (
                <span className="text-warn-ink"> · {alerts} need attention</span>
              ) : null}
              <span className="mt-0.5 block text-ink-subtle/70">
                Point at a node, or select one to open it
              </span>
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden card-premium">
      {/* light pooled behind the scene, so the core sits in a space rather
          than on a flat card */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[6%] top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-brand/10 blur-[90px]"
      />

      <div className="relative grid items-center gap-6 p-6 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-10 lg:p-8">
        {/* ------------------------------------------------------- readout */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            CampusOS core
          </p>
          <h2 className="mt-2 text-[22px] font-semibold leading-tight tracking-tight text-ink sm:text-[26px]">
            One student. One context.
          </h2>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-muted">
            Every service below is a separate system on campus. CampusOS reads them together — this
            is what it is holding for you right now.
          </p>

          {/* The readout is the tooltip's grown-up twin: the same contextual
              detail, but always on screen so touch users and keyboard users
              get it too, not only people who can hover. */}
          <div className="mt-5 min-h-[92px] rounded-tile border border-line bg-canvas/40 px-4 py-3.5">
            {active ? (
              <>
                <p
                  className={cn(
                    'text-[11px] font-medium uppercase tracking-[0.12em]',
                    readoutTone[active.tone ?? 'info'],
                  )}
                >
                  {active.label}
                  <span className="ml-2 normal-case tracking-normal text-ink-subtle">
                    {stateWord[active.tone ?? 'info']}
                  </span>
                </p>
                <p className="mt-1.5 text-[18px] font-semibold tabular-nums leading-none text-ink">
                  {active.value}
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">{active.detail}</p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-subtle">
                  Reading {nodes.length} services
                  {alerts > 0 ? (
                    <span className="ml-2 normal-case tracking-normal text-warn-ink">
                      · {alerts} need{alerts === 1 ? 's' : ''} attention
                    </span>
                  ) : null}
                </p>
                <p className="mt-1.5 text-[13.5px] leading-snug text-ink-muted">
                  Point at a node to see what CampusOS has from it, or select one to open that
                  screen.
                </p>
              </>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------- core */}
        <IntelligenceCore
          interactive
          nodes={nodes}
          converge={1}
          onActiveChange={setActive}
          className="max-w-[380px] lg:max-w-[440px]"
        />
      </div>
    </div>
  )
}
