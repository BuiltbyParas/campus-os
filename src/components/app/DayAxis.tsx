import { useEffect, useState } from 'react'

import { toMinutes } from '@/lib/agenda'
import { cn, formatTime } from '@/lib/utils'
import type { AgendaItem, AgendaKind } from '@/types'

const markerTone: Record<AgendaKind, string> = {
  class: 'bg-brand',
  deadline: 'bg-danger',
  event: 'bg-info',
  gap: 'bg-ink-subtle/40',
}

/**
 * The whole day on one axis.
 *
 * The vertical timeline below answers "what is each thing?"; this answers a
 * different question the list cannot — "what *shape* is today?" A student sees
 * in one glance that the morning is packed and the afternoon is open, or that
 * they are two thirds of the way through, without reading a single row.
 *
 * It earns its space by being real: every marker is positioned by its actual
 * clock time against the day's span, and classes are drawn as spans rather than
 * points so a three-hour lab looks like one. The "now" line is the only moving
 * part, and it moves once a minute.
 */
export function DayAxis({
  items,
  at = new Date(),
  className,
}: {
  items: AgendaItem[]
  at?: Date
  className?: string
}) {
  /* The line advances on its own. A dashboard left open through a lecture
     should not still claim the lecture is about to start. */
  const [minuteTick, setMinuteTick] = useState(() => at.getHours() * 60 + at.getMinutes())

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = new Date()
      setMinuteTick(now.getHours() * 60 + now.getMinutes())
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  const solid = items.filter((item) => item.kind !== 'gap')
  if (solid.length === 0) return null

  /* The axis spans the student's actual day, rounded out to the hour and
     padded, rather than a fixed 8am–8pm — an axis mostly showing hours with
     nothing in them wastes the width that makes the shape legible. */
  const starts = solid.map((item) => toMinutes(item.startTime))
  const ends = solid.map((item) => toMinutes(item.endTime ?? item.startTime))
  const first = Math.floor(Math.min(...starts) / 60) * 60 - 30
  const last = Math.ceil(Math.max(...ends) / 60) * 60 + 30
  const span = Math.max(60, last - first)

  const pct = (minutes: number) => ((minutes - first) / span) * 100
  const nowPct = pct(minuteTick)
  const nowVisible = nowPct >= 0 && nowPct <= 100

  /* Hour ticks, thinned on narrow axes so the labels never collide. */
  const firstHour = Math.ceil(first / 60)
  const lastHour = Math.floor(last / 60)
  const hourCount = lastHour - firstHour
  const step = hourCount > 8 ? 2 : 1
  const hours: number[] = []
  for (let hour = firstHour; hour <= lastHour; hour += step) hours.push(hour)

  return (
    <div className={cn('select-none', className)}>
      <div className="relative h-14">
        {/* the rail */}
        <div className="absolute inset-x-0 top-6 h-1.5 rounded-full bg-surface-muted" />

        {/* elapsed portion of the day */}
        {nowVisible ? (
          <div
            className="absolute top-6 h-1.5 rounded-full bg-brand/25 transition-[width] duration-1000 ease-out"
            style={{ left: 0, width: `${nowPct}%` }}
            aria-hidden
          />
        ) : null}

        {/* items */}
        {solid.map((item) => {
          const start = toMinutes(item.startTime)
          const end = toMinutes(item.endTime ?? item.startTime)
          const left = pct(start)
          const width = Math.max(1.5, pct(end) - left)
          const past = item.status === 'past'
          const active = item.status === 'now'

          return (
            <div
              key={item.id}
              className="group absolute top-[18px]"
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              <div
                className={cn(
                  'h-[18px] rounded-full transition-[transform,opacity,filter] duration-200 group-hover:scale-y-125 group-hover:brightness-125',
                  markerTone[item.kind],
                  past && 'opacity-35',
                  active && 'ring-2 ring-ok ring-offset-2 ring-offset-surface',
                )}
              />
              {/* Name on hover — the axis stays clean, the detail is a pointer away. */}
              <span className="glass pointer-events-none absolute -top-1 left-0 z-10 hidden -translate-y-full whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-medium text-ink group-hover:block">
                {item.title} · {formatTime(item.startTime)}
              </span>
            </div>
          )
        })}

        {/* now */}
        {nowVisible ? (
          <div
            className="absolute top-3 z-10 transition-[left] duration-1000 ease-out"
            style={{ left: `${nowPct}%` }}
            aria-hidden
          >
            <span className="absolute -left-px h-7 w-0.5 rounded-full bg-ok" />
            <span className="absolute -left-[3px] -top-1 size-2 rounded-full bg-ok shadow-[0_0_10px_var(--ok)]" />
          </div>
        ) : null}

        {/* hour labels */}
        <div className="absolute inset-x-0 top-[38px]">
          {hours.map((hour) => (
            <span
              key={hour}
              className="absolute -translate-x-1/2 text-[10.5px] tabular-nums text-ink-subtle"
              style={{ left: `${pct(hour * 60)}%` }}
            >
              {formatTime(`${String(hour).padStart(2, '0')}:00`)}
            </span>
          ))}
        </div>
      </div>

      <p className="sr-only">
        {solid.length} items today, from {formatTime(solid[0].startTime)} to{' '}
        {formatTime(solid[solid.length - 1].endTime ?? solid[solid.length - 1].startTime)}.
      </p>
    </div>
  )
}
