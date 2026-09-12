import { ArrowRight, CheckCircle2, Clock3, MapPin, User } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useTilt } from '@/hooks/useTilt'
import { countdown } from '@/lib/agenda'
import { cn, formatTime } from '@/lib/utils'
import type { AgendaItem } from '@/types'

/**
 * The next thing the student has to be at, given real size.
 *
 * The single filled surface on the screen. Everything else on the dashboard is
 * an outlined card, so weight alone says which block is the answer to "what do
 * I do now" — no badge or heading has to make that argument.
 *
 * When something is already running, `now` takes the headline and the next
 * item drops to a footer line: "where am I meant to be *right now*" outranks
 * everything else on the surface.
 */
export function NextClassHero({
  now,
  next,
  sessionsToday = 0,
  className,
}: {
  now?: AgendaItem
  next?: AgendaItem
  /** How many classes today held, used only by the finished-for-the-day state. */
  sessionsToday?: number
  className?: string
}) {
  const { ref, tiltProps } = useTilt({ max: 2.5, lift: 10 })

  const lead = now ?? next
  const trailing = now ? next : undefined

  /* Nothing left today is a *result*, not an absence, so the card keeps its
     size and says what the day held rather than collapsing to one grey line. */
  if (!lead) {
    return (
      <section
        className={cn(
          'card-premium relative flex min-h-[240px] flex-col items-start justify-center overflow-hidden p-6 sm:min-h-[280px] sm:p-8',
          className,
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-ok/15 blur-[80px]"
        />

        <span className="grid size-14 place-items-center rounded-full border border-ok/25 bg-ok-soft">
          <CheckCircle2 className="size-7 text-ok-ink" aria-hidden />
        </span>

        <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[1px] text-ink-faint">
          Next class
        </p>
        <p className="relative mt-2 text-[28px] font-bold tracking-[-0.02em] text-ink">
          You’re done for the day
        </p>
        <p className="relative mt-2 max-w-md text-[15px] leading-relaxed text-ink-muted">
          {sessionsToday > 0
            ? `All ${sessionsToday} of today’s classes are behind you. Tomorrow’s appear here in the morning.`
            : 'Nothing is scheduled today. Tomorrow’s classes appear here in the morning.'}
        </p>

        <Link
          to="/app/timetable"
          className="relative mt-7 inline-flex items-center gap-2 rounded-full border border-line bg-field-raised px-4 py-2.5 text-[14px] font-semibold text-ink-muted transition-[border-color,color,box-shadow] duration-200 hover:border-line-strong hover:text-ink hover:shadow-[var(--glow-xs)]"
        >
          See the week ahead
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    )
  }

  const running = Boolean(now)

  return (
    <section
      ref={ref}
      {...tiltProps}
      className={cn(
        'tilt group relative min-h-[240px] overflow-hidden rounded-card border-[1.5px] border-brand-border sm:min-h-[280px]',
        'grad-accent grad-drift text-white elev-3',
        'shadow-[var(--shadow-md),var(--glow-l)] transition-shadow duration-300',
        'hover:shadow-[var(--shadow-lg),0_0_44px_rgb(99_102_241_/_0.55)] group-hover:grad-drift-fast',
        className,
      )}
    >
      {/* Ambient depth inside the card: two soft lights that brighten on hover,
          so the surface reacts as a material rather than as a rectangle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-white/20 blur-[90px] transition-opacity duration-500 group-hover:opacity-150"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 left-8 size-64 rounded-full bg-accent-cyan/25 blur-[80px] opacity-70 transition-opacity duration-500 group-hover:opacity-100"
      />
      {/* A faint diagonal weave. At 4% it is texture, not pattern. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 14px)',
        }}
      />

      <div className="tilt-layer relative flex min-h-[240px] flex-col p-6 sm:min-h-[280px] sm:p-8">
        <div className="flex flex-wrap items-center gap-2.5">
          {running ? (
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-white opacity-60 [animation:pulse-ring_2.4s_ease-out_infinite]" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
          ) : null}
          <p className="text-[11px] font-bold uppercase tracking-[1px] text-white/70">
            {running ? 'Happening now' : 'Next class'}
          </p>
          {!running && lead.minutesUntil > 0 ? (
            <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11.5px] font-semibold backdrop-blur-sm">
              {countdown(lead.minutesUntil)}
            </span>
          ) : null}
        </div>

        <h2 className="mt-5 text-[30px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[34px]">
          {lead.title}
        </h2>

        {lead.subtitle ? (
          <p className="mt-2.5 text-[15px] leading-relaxed text-white/85">
            {running ? 'In progress' : `Starts ${countdown(lead.minutesUntil)}`}
            {' · '}
            {lead.subtitle}
          </p>
        ) : null}

        <dl className="mt-auto grid grid-cols-1 gap-5 pt-8 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-tile border border-white/25 bg-white/15 backdrop-blur-sm">
              <Clock3 className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <dt className="text-[11px] uppercase tracking-[0.5px] text-white/60">When</dt>
              <dd className="text-[17px] font-bold tabular-nums">
                {formatTime(lead.startTime)}
                {lead.endTime ? ` – ${formatTime(lead.endTime)}` : ''}
              </dd>
            </span>
          </div>

          {lead.subtitle ? (
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-tile border border-white/25 bg-white/15 backdrop-blur-sm">
                {lead.kind === 'class' || lead.kind === 'event' ? (
                  <MapPin className="size-5" aria-hidden />
                ) : (
                  <User className="size-5" aria-hidden />
                )}
              </span>
              <span className="min-w-0">
                <dt className="text-[11px] uppercase tracking-[0.5px] text-white/60">Where</dt>
                <dd className="truncate text-[15px] font-medium text-white/90">{lead.subtitle}</dd>
              </span>
            </div>
          ) : null}
        </dl>

        {lead.to ? (
          <Link
            to={lead.to}
            className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-[14px] font-semibold backdrop-blur-sm transition-[background-color,transform] duration-200 hover:bg-white/20"
          >
            View full timetable
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        ) : null}
      </div>

      {trailing ? (
        <div className="relative flex items-center gap-3 border-t border-white/20 bg-black/10 px-7 py-3.5 sm:px-8">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[1px] text-white/60">
            Then
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-white/80">
            <span className="font-semibold text-white">{trailing.title}</span>
            {trailing.subtitle ? ` · ${trailing.subtitle}` : ''}
          </span>
          <span className="shrink-0 text-[12.5px] font-medium tabular-nums text-white/70">
            {formatTime(trailing.startTime)}
          </span>
        </div>
      ) : null}
    </section>
  )
}
