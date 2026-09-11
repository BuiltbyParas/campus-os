import { CalendarDays, Check, MapPin, Users } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { eventCategoryLabel } from '@/data'
import { cn, formatDateLabel, formatTime } from '@/lib/utils'
import type { CampusEvent } from '@/types'

/**
 * An event, with registration handled inline — there is no detail page to open,
 * because everything a student needs to decide is already on the card.
 */
export function EventCard({
  event,
  registered,
  onToggleRegister,
}: {
  event: CampusEvent
  registered: boolean
  onToggleRegister: () => void
}) {
  const remaining = event.capacity - event.registered
  const nearlyFull = remaining <= event.capacity * 0.15

  return (
    <article className="flex flex-col rounded-card border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <Badge tone="outline">{eventCategoryLabel[event.category]}</Badge>
        {nearlyFull ? <Badge tone="warn">{remaining} places left</Badge> : null}
      </div>

      <h3 className="mt-3 text-[16.5px] font-semibold leading-snug tracking-tight text-ink">
        {event.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-ink-muted">
        {event.description}
      </p>

      <dl className="mt-4 space-y-2 text-[13px] text-ink-muted">
        <div className="flex items-center gap-2">
          <dt className="sr-only">When</dt>
          <CalendarDays className="size-4 shrink-0 text-ink-subtle" aria-hidden />
          <dd>
            {formatDateLabel(event.date)} · {formatTime(event.startTime)} –{' '}
            {formatTime(event.endTime)}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Where</dt>
          <MapPin className="size-4 shrink-0 text-ink-subtle" aria-hidden />
          <dd className="truncate">{event.venue}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Attendance</dt>
          <Users className="size-4 shrink-0 text-ink-subtle" aria-hidden />
          <dd>
            {event.registered} of {event.capacity} registered
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onToggleRegister}
        aria-pressed={registered}
        className={cn(
          'press mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-control text-[14px] font-medium',
          registered
            ? 'border border-ok/30 bg-ok-soft text-ok-ink'
            : 'bg-brand text-on-brand hover:bg-brand-hover',
        )}
      >
        {registered ? (
          <>
            <Check className="size-4" aria-hidden />
            Registered
          </>
        ) : (
          'Register'
        )}
      </button>
    </article>
  )
}
