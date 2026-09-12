import { useReducedMotion } from 'framer-motion'
import { ArrowRight, Clock3, MapPin, User } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { countdown } from '@/lib/agenda'
import { cn, formatTime } from '@/lib/utils'
import type { AgendaItem } from '@/types'

/**
 * The next thing the student has to be at, given real size.
 *
 * Shared by all three directions because it is the one block none of them can
 * do without — they differ only in how much width they hand it. When something
 * is already running, `now` takes the headline and the next item drops to a
 * footer line, because "where am I meant to be *right now*" outranks
 * everything.
 */
export function NextClassHero({
  now,
  next,
  className,
}: {
  now?: AgendaItem
  next?: AgendaItem
  className?: string
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [tilt, setTilt] = useState<React.CSSProperties>({})

  /* A 2–3 degree tilt toward the pointer. Clamped hard and dropped entirely
     under reduced motion: the card should feel like a physical object catching
     the light, not like it is swivelling. */
  function onPointerMove(event: React.PointerEvent) {
    if (reduced || !ref.current) return
    if (window.matchMedia('(hover: none)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    setTilt({
      transform: `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 3}deg) translateY(-6px)`,
    })
  }

  function reset() {
    setTilt({})
  }

  const lead = now ?? next
  const trailing = now ? next : undefined

  if (!lead) {
    return (
      <section
        className={cn('rounded-card border border-line bg-surface p-6 sm:p-8', className)}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
          Next class
        </p>
        <p className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          You’re done for the day
        </p>
        <p className="mt-1.5 text-[14px] text-ink-muted">
          Nothing else is scheduled. Tomorrow’s classes appear here in the morning.
        </p>
      </section>
    )
  }

  const running = Boolean(now)

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn(
        /* The one card on the screen that is filled rather than outlined. It
           carries the accent gradient because it is the single thing the
           student most needs to see — nothing else competes at this weight. */
        'group relative overflow-hidden rounded-card border border-white/15 transition-[box-shadow,transform] duration-300',
        'bg-[linear-gradient(135deg,var(--brand)_0%,var(--accent-violet)_100%)]',
        'shadow-e4 hover:shadow-[0_16px_40px_rgb(0_0_0/0.3),0_0_24px_rgb(99_102_241/0.45)]',
        className,
      )}
      style={tilt}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-white/15 blur-[90px]"
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-center gap-2">
          {running ? (
            <span aria-hidden className="relative flex size-1.5">
              <span className="absolute inline-flex size-full rounded-full bg-white opacity-60 [animation:pulse-ring_2.4s_ease-out_infinite]" />
              <span className="relative inline-flex size-1.5 rounded-full bg-white" />
            </span>
          ) : null}
          <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-white/70">
            {running ? 'Happening now' : 'Next class'}
          </p>
          {!running && lead.minutesUntil > 0 ? (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white">
              {countdown(lead.minutesUntil)}
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 text-[26px] font-bold leading-[1.1] tracking-[-0.5px] text-white sm:text-[30px]">
          {lead.title}
        </h2>

        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-[13.5px]">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Time</dt>
            <Clock3 className="size-4 shrink-0 text-white/70" aria-hidden />
            <dd className="font-semibold tabular-nums text-white">
              {formatTime(lead.startTime)}
              {lead.endTime ? ` – ${formatTime(lead.endTime)}` : ''}
            </dd>
          </div>

          {lead.subtitle ? (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Where</dt>
              {lead.kind === 'class' || lead.kind === 'event' ? (
                <MapPin className="size-4 shrink-0 text-white/70" aria-hidden />
              ) : (
                <User className="size-4 shrink-0 text-white/70" aria-hidden />
              )}
              <dd className="text-white/85">{lead.subtitle}</dd>
            </div>
          ) : null}
        </dl>

        {lead.to ? (
          <Link
            to={lead.to}
            className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-white decoration-white/60 underline-offset-4 transition-[text-decoration-color] duration-200 hover:underline"
          >
            View timetable
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        ) : null}
      </div>

      {trailing ? (
        <div className="relative flex items-center gap-3 border-t border-white/15 px-6 py-3 sm:px-8">
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.5px] text-white/60">
            Then
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-white/75">
            <span className="font-medium text-white">{trailing.title}</span>
            {trailing.subtitle ? ` · ${trailing.subtitle}` : ''}
          </span>
          <span className="shrink-0 text-[12.5px] tabular-nums text-white/60">
            {formatTime(trailing.startTime)}
          </span>
        </div>
      ) : null}
    </section>
  )
}
