import { ArrowRight, Clock3, MapPin, User } from 'lucide-react'
import { Link } from 'react-router-dom'

import { countdown } from '@/lib/agenda'
import { cn, formatTime } from '@/lib/utils'
import type { AgendaItem } from '@/types'

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
  className,
}: {
  now?: AgendaItem
  next?: AgendaItem
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
    </section>
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

  return (
    <div className="p-5 sm:p-6">
      <Label kind={kind} />

      <h2
        className={cn(
          'mt-2.5 font-semibold leading-tight tracking-tight text-ink',
          large ? 'text-[22px] sm:text-[27px]' : 'text-[18px] sm:text-[20px]',
        )}
      >
        {item.title}
      </h2>

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
