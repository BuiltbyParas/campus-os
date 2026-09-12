import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Info,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { Signal, SignalTone } from '@/types'

/**
 * One thing that needs the student, as a card.
 *
 * The tone lives on the leading edge as a thick rail rather than washing the
 * whole card in colour: four red cards side by side stop meaning "urgent" and
 * start meaning "this product is red". Colour is also never alone — every card
 * carries the source in words and an urgency badge in words, so the ranking
 * survives both colour blindness and a greyscale screenshot.
 */

const tones: Record<
  SignalTone,
  { rail: string; text: string; soft: string; ring: string; glow: string; Icon: LucideIcon }
> = {
  danger: {
    rail: 'bg-danger',
    text: 'text-danger-ink',
    soft: 'bg-danger-soft',
    ring: 'border-danger/30',
    glow: 'group-hover:shadow-[var(--shadow-sm),0_0_24px_rgb(239_68_68_/_0.28)]',
    Icon: AlertTriangle,
  },
  warn: {
    rail: 'bg-warn',
    text: 'text-warn-ink',
    soft: 'bg-warn-soft',
    ring: 'border-warn/30',
    glow: 'group-hover:shadow-[var(--shadow-sm),0_0_24px_rgb(245_158_11_/_0.28)]',
    Icon: Clock3,
  },
  info: {
    rail: 'bg-info',
    text: 'text-info-ink',
    soft: 'bg-info-soft',
    ring: 'border-info/30',
    glow: 'group-hover:shadow-[var(--shadow-sm),0_0_24px_rgb(59_130_246_/_0.28)]',
    Icon: Info,
  },
  ok: {
    rail: 'bg-ok',
    text: 'text-ok-ink',
    soft: 'bg-ok-soft',
    ring: 'border-ok/30',
    glow: 'group-hover:shadow-[var(--shadow-sm),0_0_24px_rgb(16_185_129_/_0.28)]',
    Icon: CheckCircle2,
  },
}

const sourceLabel: Record<Signal['source'], string> = {
  attendance: 'Attendance',
  timetable: 'Timetable',
  complaint: 'Service',
  deadline: 'Coursework',
  event: 'Event',
  fee: 'Finance',
  result: 'Marks',
  edu: 'EDU-Revolution',
  exam: 'Examination',
}

/** A source-specific icon reads faster than one generic warning triangle. */
const sourceIcon: Partial<Record<Signal['source'], LucideIcon>> = {
  deadline: ClipboardList,
  exam: CalendarClock,
  fee: Wallet,
}

/** Plain words for the priority, so colour is never the only signal. */
const urgencyWord: Record<SignalTone, string> = {
  danger: 'High',
  warn: 'Medium',
  info: 'Low',
  ok: 'On track',
}

export function AlertCard({ signal, className }: { signal: Signal; className?: string }) {
  const tone = tones[signal.tone]
  const Icon = sourceIcon[signal.source] ?? tone.Icon

  /* `metric` is usually a figure — "72%", "6d", "₹18,500" — and those are set
     large because a number is read before any sentence beside it. But some
     signals put a short phrase there ("Your confirmation"), and a phrase at
     26px wraps into the headline and wrecks the card. Anything longer than a
     figure is therefore rendered inline at body weight instead. */
  const figure = signal.metric && signal.metric.length <= 8 ? signal.metric : undefined

  const body = (
    <>
      {/* The rail thickens on hover rather than changing colour — the colour
          already carries meaning and must not move. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-[4px] transition-[width] duration-250 group-hover:w-[5px]',
          tone.rail,
        )}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-16 -top-20 size-52 rounded-full opacity-25 blur-[70px] transition-opacity duration-300 group-hover:opacity-45',
          tone.rail,
        )}
      />

      <div className="relative flex h-full flex-col p-6 pl-7">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'grid size-14 shrink-0 place-items-center rounded-full border transition-transform duration-250',
              'group-hover:scale-115 group-hover:rotate-[5deg]',
              tone.soft,
              tone.ring,
            )}
          >
            <Icon className={cn('size-7', tone.text)} aria-hidden />
          </span>

          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.5px]',
              tone.soft,
              tone.ring,
              tone.text,
            )}
          >
            {urgencyWord[signal.tone]}
          </span>
        </div>

        <p className={cn('mt-5 text-[11px] font-bold uppercase tracking-[1px]', tone.text)}>
          {sourceLabel[signal.source]}
        </p>

        <h3 className="mt-1.5 flex items-baseline gap-2 text-[18px] font-bold leading-snug tracking-[-0.01em] text-ink">
          {figure ? (
            <span className={cn('shrink-0 text-[26px] font-bold tabular-nums', tone.text)}>
              {figure}
            </span>
          ) : null}
          <span className="min-w-0">{signal.title}</span>
        </h3>

        {signal.metric && !figure ? (
          <p className={cn('mt-1.5 text-[13px] font-semibold', tone.text)}>{signal.metric}</p>
        ) : null}

        <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-ink-muted">
          {signal.detail}
        </p>

        {signal.action ? (
          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[14px] font-semibold text-brand-ink">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-250 group-hover:bg-[length:100%_1px]">
              {signal.action.label}
            </span>
            <ArrowRight
              className="size-4 transition-transform duration-250 group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        ) : null}
      </div>
    </>
  )

  const shell = cn(
    'card-premium group relative flex min-h-[200px] flex-col overflow-hidden',
    'rounded-tile border-l-0',
    tone.glow,
    className,
  )

  return signal.action ? (
    <Link to={signal.action.to} className={cn(shell, 'card-interactive')}>
      {body}
    </Link>
  ) : (
    <article className={shell}>{body}</article>
  )
}

/** The whole block, including what it says when there is nothing to say. */
export function AlertGrid({ signals, limit = 3 }: { signals: Signal[]; limit?: number }) {
  const shown = signals.slice(0, limit)

  if (shown.length === 0) {
    return (
      <div className="card-premium flex items-center gap-4 p-6">
        <span className="grid size-14 shrink-0 place-items-center rounded-full border border-ok/30 bg-ok-soft">
          <CheckCircle2 className="size-7 text-ok-ink" aria-hidden />
        </span>
        <div>
          <p className="text-[16px] font-bold text-ink">All clear</p>
          <p className="mt-1 text-[13.5px] text-ink-muted">
            Nothing needs your attention right now.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {shown.map((signal) => (
        <AlertCard key={signal.id} signal={signal} />
      ))}
    </div>
  )
}
