import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { SignalTone } from '@/types'

const valueTone: Record<SignalTone, string> = {
  info: 'text-ink',
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  danger: 'text-danger-ink',
}

const edgeTone: Record<SignalTone, string> = {
  info: 'before:bg-ink-subtle/40',
  ok: 'before:bg-ok',
  warn: 'before:bg-warn',
  danger: 'before:bg-danger',
}

/**
 * One figure, given room to be the point.
 *
 * The replacement for a label-and-value pair in a bordered box. Three things
 * make it read as a measurement rather than a card: the value is set large and
 * tabular, a tone rail on the leading edge carries status without needing a
 * badge, and a `visual` slot takes a meter or sparkline so the number arrives
 * with its shape.
 *
 * Becomes a link when `to` is supplied, which is how a statistic turns into a
 * way in rather than a dead end.
 */
export function StatTile({
  label,
  value,
  detail,
  tone = 'info',
  visual,
  icon: Icon,
  to,
  className,
}: {
  label: string
  /** Pre-formatted, or a `CountUp` for a headline figure. */
  value: ReactNode
  detail?: string
  tone?: SignalTone
  /** A `Meter`, `Sparkline` or similar. */
  visual?: ReactNode
  /** Sits left of the label, and picks up the accent on hover. */
  icon?: LucideIcon
  to?: string
  className?: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="flex min-w-0 items-start gap-1.5 text-[11.5px] font-medium uppercase leading-[1.35] tracking-[0.08em] text-ink-subtle">
          {Icon ? (
            <Icon
              className="mt-px size-3.5 shrink-0 transition-[color,transform] duration-200 group-hover:scale-110 group-hover:text-brand-ink"
              aria-hidden
            />
          ) : null}
          <span className="line-clamp-2 sm:line-clamp-1">{label}</span>
        </p>
        {to ? (
          <ArrowUpRight
            className="size-3.5 shrink-0 text-ink-subtle transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        ) : null}
      </div>

      <p
        className={cn(
          'mt-2 truncate text-[26px] font-semibold leading-none tracking-tight tabular-nums transition-colors duration-200',
          valueTone[tone],
          to && 'group-hover:text-brand-ink',
        )}
      >
        {value}
      </p>

      {detail ? (
        <p className="mt-1.5 line-clamp-2 text-[12px] text-ink-muted sm:line-clamp-1">{detail}</p>
      ) : null}

      {visual ? <div className="mt-3">{visual}</div> : null}
    </>
  )

  const chrome = cn(
    /* The tone rail: a 2px edge rather than a coloured background, so a grid of
       tiles stays calm even when several of them are warning. */
    /* 20px padding, per the spec — roomy enough that the figure is not
       crowded by its own container. */
    'relative overflow-hidden rounded-tile border border-line bg-surface p-5',
    'before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:content-[""]',
    edgeTone[tone],
    className,
  )

  if (to) {
    return (
      <Link to={to} className={cn(chrome, 'lift group block')}>
        {body}
      </Link>
    )
  }

  return <div className={chrome}>{body}</div>
}
