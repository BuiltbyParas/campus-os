import { ArrowUpRight } from 'lucide-react'
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
  to?: string
  className?: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-[11.5px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
          {label}
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
          'mt-2 truncate text-[26px] font-semibold leading-none tracking-tight tabular-nums',
          valueTone[tone],
        )}
      >
        {value}
      </p>

      {detail ? (
        <p className="mt-1.5 truncate text-[12px] text-ink-muted">{detail}</p>
      ) : null}

      {visual ? <div className="mt-3">{visual}</div> : null}
    </>
  )

  const chrome = cn(
    /* The tone rail: a 2px edge rather than a coloured background, so a grid of
       tiles stays calm even when several of them are warning. */
    'relative overflow-hidden rounded-tile border border-line bg-surface p-4',
    'before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:content-[""]',
    edgeTone[tone],
    className,
  )

  if (to) {
    return (
      <Link to={to} className={cn(chrome, 'press group block hover:border-line-strong')}>
        {body}
      </Link>
    )
  }

  return <div className={chrome}>{body}</div>
}
