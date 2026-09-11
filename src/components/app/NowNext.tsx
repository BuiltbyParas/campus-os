import { ArrowRight, Clock3, MapPin, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { countdown, toMinutes } from '@/lib/agenda'
import { cn, formatTime } from '@/lib/utils'
import type { AgendaItem } from '@/types'

/**
 * How far through the current block you are, as a ring.
 *
 * A free period is only meaningful as a *shape*: "24 minutes left" is a
 * number, but a ring three-quarters drained is a feeling, and it is the feeling
 * that makes a student start packing up. Ticks once a minute so it stays
 * honest on a dashboard left open.
 */
function BlockProgress({ item, size = 52 }: { item: AgendaItem; size?: number }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const now = new Date()
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const start = toMinutes(item.startTime)
  const end = item.endTime ? toMinutes(item.endTime) : start + 60
  const total = Math.max(1, end - start)
  const elapsed = Math.max(0, Math.min(total, minutesNow - start))
  const remaining = Math.max(0, end - minutesNow)

  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (elapsed / total) * circumference

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-surface-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className="stroke-ok transition-[stroke-dasharray] duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="text-[13px] font-semibold leading-none tabular-nums text-ink">
          {remaining}
        </span>
      </span>
      <span className="sr-only">{remaining} minutes remaining</span>
    </div>
  )
}

/**
 * The band that answers "where do I have to be?".
 *
 * It carries two states at once — what is happening NOW and what is NEXT —
 * because those are different questions and a student in a free period needs
 * the second one. This is the most visually dominant element on the dashboard
 * by design: everything else on the screen is context for it.
 *
 * It reads from the same merged agenda as the timeline below it, so the two can
 * never disagree about what is coming.
 */
export function NowNext({
  now,
  next,
  later,
  className,
}: {
  now?: AgendaItem
  next?: AgendaItem
  /** The thing after next — the rest of the day, in one line. */
  later?: AgendaItem
  className?: string
}) {
  /* Nothing at all left today is itself worth saying plainly. */
  if (!now && !next) {
    return (
      <section className={cn('rounded-card border border-line bg-surface p-5 sm:p-6', className)}>
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-subtle">Now</p>
        <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-ink sm:text-[24px]">
          You’re done for the day
        </h2>
        <p className="mt-1.5 text-[14px] text-ink-muted">
          Nothing else is scheduled. Your next class appears here tomorrow.
        </p>
      </section>
    )
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-card border border-line bg-surface',
        className,
      )}
    >
      {/* One soft light source, tinted by the accent. The only ambient gradient
          on the dashboard — more would be decoration competing with data. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-brand/15 blur-[90px]"
      />

      {/* With nothing running, a two-up split leaves half the band blank. The
          band collapses to a single NEXT instead — an empty card is worse than
          no card. */}
      {now ? (
        <div className="relative grid divide-y divide-line sm:grid-cols-[1.15fr_1fr] sm:divide-x sm:divide-y-0">
          <Slot item={now} kind="now" />
          <Slot item={next} kind="next" />
        </div>
      ) : (
        <div className="relative">
          <Slot item={next} kind="next" solo />
        </div>
      )}

      {/* LATER is a footnote, not a third panel. Giving it equal weight would
          flatten the hierarchy the band exists to create — the whole point is
          that NOW is urgent, NEXT is imminent, and later is merely true. */}
      {later ? <LaterStrip item={later} /> : null}
    </section>
  )
}

function LaterStrip({ item }: { item: AgendaItem }) {
  const body = (
    <>
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-subtle">
        Later
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-ink-muted">
        <span className="font-medium text-ink">{item.title}</span>
        {item.subtitle ? ` · ${item.subtitle}` : ''}
      </span>
      <span className="shrink-0 text-[12.5px] tabular-nums text-ink-subtle">
        {formatTime(item.startTime)}
      </span>
    </>
  )

  if (item.to) {
    return (
      <Link
        to={item.to}
        className="relative flex items-center gap-3 border-t border-line px-5 py-3 transition-colors hover:bg-surface-raised sm:px-6"
      >
        {body}
      </Link>
    )
  }

  return (
    <div className="relative flex items-center gap-3 border-t border-line px-5 py-3 sm:px-6">
      {body}
    </div>
  )
}

function Slot({
  item,
  kind,
  solo = false,
}: {
  item?: AgendaItem
  kind: 'now' | 'next'
  /** The band collapsed to one slot, so this one carries the emphasis. */
  solo?: boolean
}) {
  const isNow = kind === 'now'

  if (!item) {
    return (
      <div className="p-5 sm:p-6">
        <Label kind={kind} />
        <p className="mt-2.5 text-[17px] font-medium text-ink-muted">
          {isNow ? 'Free period' : 'Nothing else today'}
        </p>
      </div>
    )
  }

  const isGap = item.kind === 'gap'
  const large = isNow || solo

  /* Only the running block gets a ring: a countdown on something that has not
     started yet would be measuring nothing. */
  const showProgress = isNow && item.endTime

  return (
    <div className="p-5 sm:p-6">
      <Label kind={kind} />

      <div className="mt-2.5 flex items-start gap-4">
        {showProgress ? <BlockProgress item={item} /> : null}
        <div className="min-w-0 flex-1">
          <h2
            className={cn(
              'font-semibold leading-tight tracking-tight text-ink',
              large ? 'text-[22px] sm:text-[27px]' : 'text-[18px] sm:text-[20px]',
            )}
          >
            {item.title}
          </h2>
          {showProgress ? (
            <p className="mt-1 text-[13px] text-ink-muted">
              until {formatTime(item.endTime!)}
            </p>
          ) : null}
        </div>
      </div>

      {/* The countdown is the point of the NEXT slot — it is what turns a
          timetable entry into something you act on. */}
      {!isNow && item.minutesUntil > 0 ? (
        <p className="mt-1.5 text-[14px] font-medium text-brand-ink">
          Starts {countdown(item.minutesUntil)}
          {solo ? <span className="text-ink-subtle"> · nothing scheduled until then</span> : null}
        </p>
      ) : null}

      {isNow && isGap && item.subtitle ? (
        <p className="mt-1.5 text-[14px] text-ink-muted">{item.subtitle}</p>
      ) : null}

      <dl
        className={cn(
          'mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]',
          isGap && 'hidden',
        )}
      >
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Time</dt>
          <Clock3 className="size-3.5 text-ink-subtle" aria-hidden />
          <dd className="text-ink-muted">
            {formatTime(item.startTime)}
            {item.endTime ? ` – ${formatTime(item.endTime)}` : ''}
          </dd>
        </div>
        {item.subtitle ? (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Where</dt>
            {item.kind === 'class' || item.kind === 'event' ? (
              <MapPin className="size-3.5 text-ink-subtle" aria-hidden />
            ) : (
              <User className="size-3.5 text-ink-subtle" aria-hidden />
            )}
            <dd className="text-ink-muted">{item.subtitle}</dd>
          </div>
        ) : null}
      </dl>

      {item.to ? (
        <Link
          to={item.to}
          className="group mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink transition-colors hover:text-ink"
        >
          {item.kind === 'class' ? 'View timetable' : 'Open'}
          <ArrowRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      ) : null}
    </div>
  )
}

function Label({ kind }: { kind: 'now' | 'next' }) {
  const isNow = kind === 'now'
  return (
    <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-subtle">
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
