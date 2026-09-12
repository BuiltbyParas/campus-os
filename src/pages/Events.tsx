import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Clock3, MapPin, Users } from 'lucide-react'
import { useRef, useState } from 'react'

import { useStore } from '@/app/store'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Meter } from '@/components/ui/Meter'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { eventCategoryLabel } from '@/data'
import { cn, daysUntil, formatDateLabel, formatTime } from '@/lib/utils'
import { useEvents } from '@/services/queries'
import type { CampusEvent, EventCategory } from '@/types'

type Filter = EventCategory | 'all'

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...(Object.keys(eventCategoryLabel) as EventCategory[]).map((category) => ({
    value: category,
    label: eventCategoryLabel[category],
  })),
]

/**
 * Campus discovery.
 *
 * A three-column grid of identical cards is a directory: every event is given
 * the same weight, so the student has to read all of them to find the one worth
 * going to. This screen takes a position instead — one event is the spotlight,
 * the rest run along a rail you scan sideways in a second, and the filter
 * reshapes both.
 *
 * The horizontal rail is the point of difference: browsing sideways is a
 * different motion from reading down a page, and it is what makes this feel
 * like discovery rather than administration.
 */
export default function Events() {
  const [filter, setFilter] = useState<Filter>('all')
  const { isRegistered, toggleRegistered } = useStore()
  const events = useEvents({ category: filter })

  const list = events.data ?? []
  /* The listing arrives in date order, so the soonest event is the spotlight —
     relevance here is simply "what is next", not an editorial choice. */
  const [featured, ...rest] = list

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Events"
        description="What’s on across campus over the next few weeks."
      />

      {/* ------------------------------------------------------------ filters */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="group"
        aria-label="Filter events"
      >
        {filters.map((entry) => {
          const active = filter === entry.value
          return (
            <button
              key={entry.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(entry.value)}
              className={cn(
                'press shrink-0 rounded-full border px-3.5 py-2.5 text-[13px] font-medium transition-colors sm:py-2',
                active
                  ? 'border-brand-border/50 bg-brand-soft text-ink'
                  : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              {entry.label}
            </button>
          )
        })}
      </div>

      {events.isPending ? (
        <div className="space-y-5">
          <Skeleton className="h-[300px] w-full rounded-card" />
          <div className="flex gap-4">
            <Skeleton className="h-[190px] w-[280px] shrink-0 rounded-card" />
            <Skeleton className="h-[190px] w-[280px] shrink-0 rounded-card" />
            <Skeleton className="hidden h-[190px] w-[280px] shrink-0 rounded-card sm:block" />
          </div>
        </div>
      ) : events.isError ? (
        <ErrorState
          title="Events are unavailable"
          description="We could not load the event listing just now."
          onRetry={() => events.refetch()}
        />
      ) : list.length === 0 ? (
        <EmptyState
          title="Nothing scheduled"
          description={
            filter === 'all'
              ? 'There are no events on campus right now. New ones appear here as they are announced.'
              : `No ${eventCategoryLabel[filter as EventCategory].toLowerCase()} events right now. Try another category.`
          }
          action={
            filter !== 'all' ? (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="press inline-flex h-10 items-center rounded-control border border-line bg-surface px-4 text-[13.5px] font-medium text-ink hover:border-line-strong"
              >
                Show everything
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Spotlight
            event={featured}
            registered={isRegistered(featured.id)}
            onToggle={() => toggleRegistered(featured.id)}
          />

          {rest.length > 0 ? (
            <Rail
              events={rest}
              isRegistered={isRegistered}
              onToggle={toggleRegistered}
            />
          ) : null}
        </>
      )}

      <p className="text-[12.5px] text-ink-subtle">
        Demo listing — these events are sample data and saving is stored in this browser only.
      </p>
    </PageContainer>
  )
}

/* ---------------------------------------------------------------- spotlight */

function Spotlight({
  event,
  registered,
  onToggle,
}: {
  event: CampusEvent
  registered: boolean
  onToggle: () => void
}) {
  const remaining = event.capacity - event.registered
  const fillPercent = (event.registered / Math.max(1, event.capacity)) * 100
  const nearlyFull = remaining <= event.capacity * 0.15
  const days = daysUntil(event.date)

  return (
    <section className="relative overflow-hidden card-premium">
      {/* Two light sources rather than one flat tint — the spotlight should feel
          lit from somewhere, which is what separates it from the rail below. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-32 size-[420px] rounded-full bg-brand/18 blur-[100px]" />
        <div className="absolute -bottom-32 left-[10%] size-[320px] rounded-full bg-info/12 blur-[90px]" />
      </div>

      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brand-border/50 bg-brand-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-ink">
              {eventCategoryLabel[event.category]}
            </span>
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              {days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
            </span>
          </div>

          <h2 className="mt-4 text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[34px]">
            {event.title}
          </h2>

          <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-ink-muted">
            {event.description}
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-[13.5px]">
            <div className="flex items-center gap-2">
              <dt className="sr-only">When</dt>
              <Clock3 className="size-4 shrink-0 text-ink-subtle" aria-hidden />
              <dd className="text-ink">
                {formatDateLabel(event.date)} · {formatTime(event.startTime)}–
                {formatTime(event.endTime)}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Where</dt>
              <MapPin className="size-4 shrink-0 text-ink-subtle" aria-hidden />
              <dd className="text-ink">{event.venue}</dd>
            </div>
          </dl>
        </div>

        {/* the decision panel */}
        <div className="flex flex-col justify-end gap-4 lg:border-l lg:border-line lg:pl-10">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
                <Users className="size-3.5 text-ink-subtle" aria-hidden />
                {event.registered} of {event.capacity} going
              </p>
              <p
                className={cn(
                  'text-[12.5px] font-medium tabular-nums',
                  nearlyFull ? 'text-warn-ink' : 'text-ink-subtle',
                )}
              >
                {remaining} left
              </p>
            </div>
            <Meter
              value={fillPercent}
              tone={nearlyFull ? 'warn' : 'brand'}
              label={`${event.registered} of ${event.capacity} places taken`}
              className="mt-2.5"
            />
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-pressed={registered}
            className={cn(
              'press inline-flex h-11 w-full items-center justify-center gap-2 rounded-control text-[14.5px] font-medium',
              registered
                ? 'border border-ok/30 bg-ok-soft text-ok-ink'
                : 'bg-brand text-on-brand shadow-[0_0_0_1px_var(--brand-border),0_14px_40px_-16px_var(--brand)] hover:bg-brand-hover',
            )}
          >
            {registered ? (
              <>
                <BookmarkCheck className="size-4" aria-hidden />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="size-4" aria-hidden />
                Save this event
              </>
            )}
          </button>

          <p className="text-[11.5px] leading-snug text-ink-subtle">
            Organised by {event.organizer}. Saving keeps it on your dashboard.
          </p>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- rail */

function Rail({
  events,
  isRegistered,
  onToggle,
}: {
  events: CampusEvent[]
  isRegistered: (id: string) => boolean
  onToggle: (id: string) => void
}) {
  const scroller = useRef<HTMLUListElement>(null)

  function scrollBy(direction: 1 | -1) {
    scroller.current?.scrollBy({ left: direction * 320, behavior: 'smooth' })
  }

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">Also coming up</h2>

        {/* Arrows are pointer affordances only — touch scrolls the rail
            directly, and keyboard users tab through the cards themselves. */}
        <div className="hidden gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="press grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink sm:size-8"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="press grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink sm:size-8"
          >
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <ul
        ref={scroller}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-none"
      >
        {events.map((event) => {
          const saved = isRegistered(event.id)
          const days = daysUntil(event.date)

          return (
            <li
              key={event.id}
              className="w-[268px] shrink-0 snap-start sm:w-[292px]"
            >
              <article className="lift lift-accent group flex h-full flex-col card-premium p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                    {eventCategoryLabel[event.category]}
                  </span>
                  <span className="shrink-0 text-[11.5px] font-medium tabular-nums text-ink-muted">
                    {days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                  </span>
                </div>

                <h3 className="mt-2.5 line-clamp-2 text-[15px] font-semibold leading-snug text-ink">
                  {event.title}
                </h3>

                <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
                  <Clock3 className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
                  {formatTime(event.startTime)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 truncate text-[12.5px] text-ink-muted">
                  <MapPin className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
                  <span className="truncate">{event.venue}</span>
                </p>

                <button
                  type="button"
                  onClick={() => onToggle(event.id)}
                  aria-pressed={saved}
                  className={cn(
                    'mt-auto inline-flex h-11 items-center justify-center gap-1.5 rounded-control border text-[12.5px] font-medium transition-colors sm:h-9',
                    'mt-4',
                    saved
                      ? 'border-ok/30 bg-ok-soft text-ok-ink'
                      : 'border-line bg-surface-raised text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  {saved ? (
                    <>
                      <BookmarkCheck className="size-3.5" aria-hidden />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="size-3.5" aria-hidden />
                      Save
                    </>
                  )}
                </button>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
