import { useState } from 'react'

import { useStore } from '@/app/store'
import { EventCard } from '@/components/app/EventCard'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { eventCategoryLabel } from '@/data'
import { cn } from '@/lib/utils'
import { useEvents } from '@/services/queries'
import type { EventCategory } from '@/types'

type Filter = EventCategory | 'all'

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...(Object.keys(eventCategoryLabel) as EventCategory[]).map((category) => ({
    value: category,
    label: eventCategoryLabel[category],
  })),
]

export default function Events() {
  const [filter, setFilter] = useState<Filter>('all')
  const { isRegistered, toggleRegistered } = useStore()
  const events = useEvents({ category: filter })

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Events"
        description="What’s on across campus over the next few weeks."
      />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Filter events">
        {filters.map((entry) => {
          const active = filter === entry.value
          return (
            <button
              key={entry.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(entry.value)}
              className={cn(
                'press shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-medium',
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
        <SkeletonGrid count={3} />
      ) : events.isError ? (
        <ErrorState
          title="Events are unavailable"
          description="We could not load the event listing just now."
          onRetry={() => events.refetch()}
        />
      ) : (events.data ?? []).length === 0 ? (
        <EmptyState
          title="Nothing scheduled"
          description="There are no events in this category right now."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(events.data ?? []).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              registered={isRegistered(event.id)}
              onToggleRegister={() => toggleRegistered(event.id)}
            />
          ))}
        </div>
      )}

      <p className="text-[12.5px] text-ink-subtle">
        Demo listing — these events are sample data and registration is stored in this browser only.
      </p>
    </PageContainer>
  )
}
