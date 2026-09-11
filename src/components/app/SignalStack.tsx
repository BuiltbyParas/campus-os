import { AlertTriangle, ArrowRight, Bell, CheckCircle2, Clock3, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { Signal, SignalTone } from '@/types'

const toneStyle: Record<SignalTone, { wrap: string; icon: string; Icon: typeof Info }> = {
  info: { wrap: 'border-line bg-surface', icon: 'text-info', Icon: Info },
  ok: { wrap: 'border-ok/25 bg-ok-soft/30', icon: 'text-ok-ink', Icon: CheckCircle2 },
  warn: { wrap: 'border-warn/25 bg-warn-soft/30', icon: 'text-warn-ink', Icon: Clock3 },
  danger: { wrap: 'border-danger/25 bg-danger-soft/30', icon: 'text-danger-ink', Icon: AlertTriangle },
}

/**
 * What CampusOS noticed on the student's behalf.
 *
 * This is the product's core claim made visible: a portal waits to be asked,
 * this speaks first. Every entry carries the action that resolves it, so
 * noticing and acting are one step rather than two.
 *
 * The list is capped deliberately — surfacing everything is the same as
 * surfacing nothing, so only the highest-urgency signals earn the space.
 */
export function SignalStack({
  signals,
  limit = 3,
  className,
}: {
  signals: Signal[]
  limit?: number
  className?: string
}) {
  const shown = signals.slice(0, limit)

  if (shown.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5',
          className,
        )}
      >
        <CheckCircle2 className="size-4 shrink-0 text-ok" aria-hidden />
        <p className="text-[13.5px] text-ink-muted">
          Nothing needs your attention right now.
        </p>
      </div>
    )
  }

  return (
    <ul className={cn('space-y-2.5', className)} aria-label="Things that need attention">
      {shown.map((signal) => {
        const tone = toneStyle[signal.tone]
        return (
          <li
            key={signal.id}
            className={cn(
              'flex items-start gap-3 rounded-card border px-4 py-3 sm:items-center',
              tone.wrap,
            )}
          >
            <tone.Icon className={cn('mt-0.5 size-4 shrink-0 sm:mt-0', tone.icon)} aria-hidden />

            {/* On a wide screen the detail sits beside the title rather than
                under it, so a row of signals stays one line tall. */}
            <div className="min-w-0 flex-1 lg:flex lg:items-baseline lg:gap-2.5">
              <p className="text-[13.5px] font-medium leading-snug text-ink lg:shrink-0">
                {signal.title}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted lg:mt-0 lg:truncate">
                {signal.detail}
              </p>
            </div>

            {signal.action ? (
              <Link
                to={signal.action.to}
                className="group inline-flex shrink-0 items-center gap-1 self-start rounded-control border border-line bg-surface/70 px-2.5 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-line-strong sm:self-auto"
              >
                <span className="hidden sm:inline">{signal.action.label}</span>
                <span className="sm:hidden">Open</span>
                <ArrowRight
                  className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

/** Compact count for the header, so the stack can stay short. */
export function SignalCount({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-subtle">
      <Bell className="size-3.5" aria-hidden />
      {signals.length} {signals.length === 1 ? 'signal' : 'signals'}
    </span>
  )
}
