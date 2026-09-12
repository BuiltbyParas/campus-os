import { CalendarRange, Clock3, FileText, GraduationCap, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

import { countdown } from '@/lib/agenda'
import { cn, formatTime } from '@/lib/utils'
import type { AgendaItem, AgendaKind } from '@/types'

const kindIcon: Record<AgendaKind, typeof Clock3> = {
  class: GraduationCap,
  deadline: FileText,
  event: CalendarRange,
  gap: Clock3,
}

/**
 * The student's day as one vertical rail.
 *
 * Classes, coursework and events share a single spine because that is how a day
 * is actually experienced — the alternative, three stacked lists, makes the
 * student do the merging in their head. The rail is what turns a set of cards
 * into a timeline.
 */
export function TodayTimeline({ items }: { items: AgendaItem[] }) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-[13.5px] text-ink-muted">
        Nothing scheduled today.
      </p>
    )
  }

  return (
    <ol className="relative">
      {items.map((item, index) => {
        const Icon = kindIcon[item.kind]
        const past = item.status === 'past'
        const now = item.status === 'now'
        const next = item.status === 'next'
        const gap = item.kind === 'gap'
        const last = index === items.length - 1

        const interactive = Boolean(item.to) && !gap
        const contentClass = cn(
          'mb-2 min-w-0 flex-1 rounded-tile px-3 py-3 transition-colors duration-200',
          gap && 'opacity-60',
          past && !gap && 'opacity-45',
          now && 'bg-ok-soft',
          next && 'bg-brand-soft',
          interactive && !now && !next && 'hover:bg-surface-raised hover:translate-x-0.5',
          interactive && (now || next) && 'hover:brightness-110 hover:translate-x-0.5',
          interactive && 'transition-[background-color,transform,filter] duration-200',
        )

        const body = (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    'size-3.5 shrink-0',
                    now ? 'text-ok-ink' : next ? 'text-brand-ink' : 'text-ink-subtle',
                  )}
                  aria-hidden
                />
                <p
                  className={cn(
                    'truncate text-[14px]',
                    gap ? 'font-normal text-ink-muted' : 'font-medium text-ink',
                  )}
                >
                  {item.title}
                </p>
              </div>

              {item.subtitle ? (
                <p className="mt-1 flex items-center gap-1.5 truncate pl-[22px] text-[12.5px] text-ink-subtle">
                  {item.kind === 'class' || item.kind === 'event' ? (
                    <MapPin className="size-3 shrink-0" aria-hidden />
                  ) : null}
                  {item.subtitle}
                </p>
              ) : null}
            </div>

            {/* Countdown only while it is actionable — "in 7h" tells a student
                nothing they can act on, and costs the title its width. */}
            {(now || (next && item.minutesUntil <= 90)) && !gap ? (
              <span
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium',
                  now ? 'bg-ok/15 text-ok-ink' : 'bg-brand/15 text-brand-ink',
                )}
              >
                {now ? 'Now' : countdown(item.minutesUntil)}
              </span>
            ) : null}
          </div>
        )

        return (
          <li key={item.id} className="relative flex gap-3 sm:gap-4">
            {/* time column */}
            <div className="w-[52px] shrink-0 pt-4 text-right sm:w-[58px]">
              <p
                className={cn(
                  'text-[12.5px] font-medium tabular-nums',
                  past ? 'text-ink-subtle' : 'text-ink',
                )}
              >
                {formatTime(item.startTime)}
              </p>
            </div>

            {/* spine */}
            <div className="relative flex w-4 shrink-0 justify-center">
              {!last ? (
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-6 h-[calc(100%-1rem)] w-px',
                    past ? 'bg-line' : 'bg-line-strong',
                  )}
                />
              ) : null}
              <span
                aria-hidden
                className={cn(
                  'relative z-10 mt-[18px] size-2.5 rounded-full ring-4 ring-canvas',
                  now
                    ? 'bg-ok'
                    : next
                      ? 'bg-brand'
                      : past
                        ? 'bg-ink-subtle/40'
                        : gap
                          ? 'bg-transparent ring-0 outline outline-1 outline-line-strong'
                          : 'bg-ink-subtle/50',
                )}
              />
            </div>

            {/* content */}
            {interactive ? (
              <Link to={item.to!} className={contentClass}>
                {body}
              </Link>
            ) : (
              <div className={contentClass}>{body}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
