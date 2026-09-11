import { ArrowRight, Clock3, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { CampusCore } from '@/components/app/CampusCore'
import { courseById } from '@/data'
import { countdown, toMinutes } from '@/lib/agenda'
import { formatMoney } from '@/lib/fees'
import { cn, daysUntil, formatTime, greeting } from '@/lib/utils'
import type { SmartAction } from '@/services/signals'
import type { TodayView } from '@/services/today'
import type { AgendaItem } from '@/types'

/**
 * The command deck.
 *
 * The dashboard used to open on a stack of bordered boxes; this is one
 * composed region instead. There is deliberately **no card** here — the
 * greeting, the live state, the core and the now/next pair share a single
 * ambient ground separated by hairlines, so the eye reads one instrument panel
 * rather than four containers.
 *
 * Layout follows the student's attention: who they are and how today stands on
 * the left, the core they can interrogate in the middle, and what is happening
 * to them right now on the right.
 */
export function CommandDeck({
  view,
  name,
  at,
  isPending,
}: {
  view: TodayView
  name: string
  at: Date
  isPending?: boolean
}) {
  /* One recommendation, not a row of pills. `buildSmartActions` already ranks
     them by what is true right now, so the top of that ranking is the only one
     worth the space — the rest stay reachable from the attention stack and
     the command palette. */
  const recommended: SmartAction | undefined = view.smartActions[0]

  return (
    <section className="relative">
      {/* the ground: a pooled light rather than a panel */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-30%] h-[420px] w-[880px] -translate-x-1/2 rounded-[50%] bg-brand/[0.09] blur-[110px]" />
      </div>

      <div className="flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)_minmax(0,300px)] xl:items-start xl:gap-10">
        {/* ------------------------------------------------------ identity */}
        <div className="order-1 min-w-0 xl:order-1">
          <p className="text-[12.5px] font-medium uppercase tracking-[0.14em] text-ink-subtle">
            {at.toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <h1 className="mt-2 text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[40px]">
            {greeting(at)},
            <br />
            <span className="text-gradient-brand">{name}.</span>
          </h1>

          <StateStrip view={view} isPending={isPending} />

          {!isPending && recommended ? (
            <Link
              to={recommended.to}
              className="press group mt-7 inline-flex items-center gap-2.5 rounded-full border border-brand-border/50 bg-brand-soft py-2 pl-4 pr-3 text-[13px] font-medium text-ink"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink">
                Suggested
              </span>
              <span className="truncate">{recommended.label}</span>
              <ArrowRight
                className="size-3.5 shrink-0 text-brand-ink transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          ) : null}
        </div>

        {/* ---------------------------------------------------------- core */}
        {/* The centrepiece, and the only part of the screen that is spatial.
            It drops below now/next on narrow screens: on a phone the first
            thing a student needs is where to be, not the visualisation. */}
        <div className="order-3 min-w-0 xl:order-2">
          <CampusCore
            attendance={view.attendance}
            sessions={view.todaySessions}
            complaints={view.openRequests}
            events={[]}
            fees={view.fees}
            edu={view.edu}
            isPending={isPending}
            at={at}
            bare
          />
        </div>

        {/* --------------------------------------------------- now / next */}
        <div className="order-2 min-w-0 divide-y divide-line border-y border-line xl:order-3 xl:border-t-0">
          <NowBlock item={view.now} />
          <NextBlock item={view.next} />
          {view.later ? <LaterLine item={view.later} /> : null}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ state strip */

/**
 * Today in six figures.
 *
 * Typographic, not tiled: each figure is a number with a word under it,
 * separated by hairlines. Putting these in cards would add five more rectangles
 * to a screen whose whole problem was rectangles.
 */
function StateStrip({ view, isPending }: { view: TodayView; isPending?: boolean }) {
  if (isPending) {
    return (
      <div className="mt-7 h-[52px] animate-pulse rounded-tile bg-surface-muted" />
    )
  }

  const weakest = view.weakestCourse
  const deadlines = view.agenda.filter((item) => item.kind === 'deadline').length

  const stats: { value: string; label: string; to: string; tone?: string }[] = [
    {
      value: String(view.todaySessions.length),
      label: view.todaySessions.length === 1 ? 'class' : 'classes',
      to: '/app/timetable',
    },
    ...(deadlines > 0
      ? [{ value: String(deadlines), label: 'due today', to: '/app/timetable', tone: 'text-warn-ink' }]
      : []),
    ...(weakest
      ? [
          {
            value: `${Math.round(weakest.percentage)}%`,
            label: courseById.get(weakest.courseId)?.short ?? 'lowest',
            to: '/app/attendance',
            tone: weakest.status === 'below' ? 'text-danger-ink' : 'text-warn-ink',
          },
        ]
      : []),
    ...(view.openRequests.length > 0
      ? [
          {
            value: String(view.openRequests.length),
            label: view.openRequests.length === 1 ? 'request' : 'requests',
            to: '/app/complaints',
          },
        ]
      : []),
    ...(view.fees?.nextDue
      ? [
          {
            value: formatMoney(view.fees.nextDue.amount, view.fees.currency),
            label: `in ${daysUntil(view.fees.nextDue.dueDate)}d`,
            to: '/app/fees',
          },
        ]
      : []),
    ...(view.edu
      ? [
          {
            value: `${view.edu.completed}/${view.edu.required}`,
            label: 'EDU-Rev',
            to: '/app/academics',
          },
        ]
      : []),
  ]

  return (
    <dl className="mt-7 flex flex-wrap gap-x-6 gap-y-4">
      {stats.map((stat, index) => (
        <Link
          key={stat.label}
          to={stat.to}
          className={cn(
            'group min-w-0 transition-opacity hover:opacity-100',
            index > 0 && 'border-l border-line pl-6',
          )}
        >
          <dd
            className={cn(
              'text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums',
              stat.tone ?? 'text-ink',
            )}
          >
            {stat.value}
          </dd>
          <dt className="mt-1.5 whitespace-nowrap text-[11.5px] text-ink-subtle transition-colors group-hover:text-ink-muted">
            {stat.label}
          </dt>
        </Link>
      ))}
    </dl>
  )
}

/* ------------------------------------------------------------ now / next */

/** How far through the running block you are, as a thin arc. */
function NowBlock({ item }: { item?: AgendaItem }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])

  if (!item) {
    return (
      <div className="py-4 xl:pt-0">
        <Label kind="now" />
        <p className="mt-2 text-[16px] font-medium text-ink-muted">Nothing running</p>
      </div>
    )
  }

  const now = new Date()
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const start = toMinutes(item.startTime)
  const end = item.endTime ? toMinutes(item.endTime) : start + 60
  const total = Math.max(1, end - start)
  const elapsed = Math.max(0, Math.min(total, minutesNow - start))
  const remaining = Math.max(0, end - minutesNow)

  return (
    <div className="py-4 xl:pt-0">
      <Label kind="now" />
      <p className="mt-2 text-[18px] font-semibold leading-tight tracking-tight text-ink">
        {item.title}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-ok transition-[width] duration-1000 ease-out"
            style={{ width: `${(elapsed / total) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-[12px] font-medium tabular-nums text-ok-ink">
          {remaining}m left
        </span>
      </div>
    </div>
  )
}

function NextBlock({ item }: { item?: AgendaItem }) {
  if (!item) {
    return (
      <div className="py-4">
        <Label kind="next" />
        <p className="mt-2 text-[16px] font-medium text-ink-muted">Nothing else today</p>
      </div>
    )
  }

  return (
    <div className="py-4">
      <Label kind="next" />
      <p className="mt-2 text-[18px] font-semibold leading-tight tracking-tight text-ink">
        {item.title}
      </p>

      {item.minutesUntil > 0 ? (
        <p className="mt-1.5 text-[13px] font-medium text-brand-ink">
          {countdown(item.minutesUntil)}
        </p>
      ) : null}

      <dl className="mt-3 space-y-1.5 text-[12.5px] text-ink-muted">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Time</dt>
          <Clock3 className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
          <dd className="tabular-nums">
            {formatTime(item.startTime)}
            {item.endTime ? `–${formatTime(item.endTime)}` : ''}
          </dd>
        </div>
        {item.subtitle ? (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Where</dt>
            <MapPin className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
            <dd className="truncate">{item.subtitle}</dd>
          </div>
        ) : null}
      </dl>

      {item.to ? (
        <Link
          to={item.to}
          className="group mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-ink transition-colors hover:text-ink"
        >
          Open
          <ArrowRight
            className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      ) : null}
    </div>
  )
}

function LaterLine({ item }: { item: AgendaItem }) {
  return (
    <div className="flex items-baseline gap-2.5 py-3">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
        Later
      </span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-muted">{item.title}</span>
      <span className="shrink-0 text-[12px] tabular-nums text-ink-subtle">
        {formatTime(item.startTime)}
      </span>
    </div>
  )
}

function Label({ kind }: { kind: 'now' | 'next' }) {
  const isNow = kind === 'now'
  return (
    <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
      {isNow ? (
        <span aria-hidden className="relative flex size-1.5">
          <span className="absolute inline-flex size-full rounded-full bg-ok opacity-60 [animation:pulse-ring_2.4s_ease-out_infinite]" />
          <span className="relative inline-flex size-1.5 rounded-full bg-ok" />
        </span>
      ) : null}
      {isNow ? 'Now' : 'Next'}
    </p>
  )
}
