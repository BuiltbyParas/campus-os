import { ArrowRight, CalendarRange, FileText, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { PulseItem } from '@/services/signals'
import type { SignalTone } from '@/types'

const kindIcon = {
  deadline: FileText,
  event: CalendarRange,
  notice: Megaphone,
} as const

const toneDot: Record<SignalTone, string> = {
  info: 'bg-info',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
}

/**
 * Campus Pulse.
 *
 * A finite, chronological list of what is about to happen — not a feed. Every
 * row either concerns this student directly or is something they can act on,
 * and rows are hairline-divided rather than boxed so the section reads as one
 * object instead of four more cards.
 */
export function CampusPulse({ items, className }: { items: PulseItem[]; className?: string }) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          'rounded-card border border-dashed border-line bg-surface/50 px-5 py-8 text-center',
          className,
        )}
      >
        <p className="text-[14px] font-medium text-ink">Quiet day</p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Nothing scheduled or outstanding in the next day.
        </p>
      </div>
    )
  }

  return (
    <ul
      className={cn(
        'divide-y divide-line overflow-hidden card-premium',
        className,
      )}
    >
      {items.map((item) => {
        const Icon = kindIcon[item.kind]
        return (
          <li key={item.id} className="flex items-start gap-3.5 px-4 py-3.5">
            <span aria-hidden className="mt-[7px] flex shrink-0 items-center">
              <span className={cn('size-1.5 rounded-full', toneDot[item.tone])} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 text-[11.5px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
                  {item.when}
                </span>
                <Icon className="size-3 shrink-0 text-ink-subtle" aria-hidden />
              </div>
              <p className="mt-1 line-clamp-2 text-[14px] font-medium text-ink sm:line-clamp-1">{item.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[12.5px] text-ink-subtle sm:line-clamp-1">{item.detail}</p>
            </div>

            {item.action ? (
              <Link
                to={item.action.to}
                className="group mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-control border border-line px-2.5 py-2.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink sm:py-1.5"
              >
                {item.action.label}
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
