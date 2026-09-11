import { useState } from 'react'
import { ArrowRight, CalendarRange, FileText, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'
import { useAnnouncements, useDeadlines, useEvents } from '@/services/queries'
import { buildPulse } from '@/services/signals'
import type { SignalTone } from '@/types'

const toneDot: Record<SignalTone, string> = {
  info: 'bg-info',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
}

const kindIcon = {
  deadline: FileText,
  event: CalendarRange,
  notice: Megaphone,
} as const

type Filter = 'all' | 'deadline' | 'event' | 'notice'

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'deadline', label: 'Deadlines' },
  { value: 'event', label: 'Events' },
  { value: 'notice', label: 'Notices' },
]

export default function CampusPulse() {
  const [filter, setFilter] = useState<Filter>('all')
  
  const deadlines = useDeadlines()
  const events = useEvents()
  const announcements = useAnnouncements()
  
  const isPending = deadlines.isPending || events.isPending || announcements.isPending
  const isError = deadlines.isError || events.isError || announcements.isError
  
  const items = buildPulse({
    deadlines: deadlines.data ?? [],
    events: events.data ?? [],
    notices: announcements.data ?? []
  }).filter(item => filter === 'all' || item.kind === filter)
  
  const todayItems = items.filter(i => i.when !== 'Tomorrow')
  const tomorrowItems = items.filter(i => i.when === 'Tomorrow')
  
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Campus Pulse"
        description="What is happening on campus"
      />
      
      <Tabs tabs={tabs} active={filter} onChange={setFilter as any} />
      
      {isPending ? (
        <SkeletonGrid count={4} />
      ) : isError ? (
        <ErrorState
          title="Pulse is unavailable"
          description="We could not load campus pulse just now."
          onRetry={() => {
            deadlines.refetch()
            events.refetch()
            announcements.refetch()
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nothing right now"
          description="There are no items matching this filter."
        />
      ) : (
        <div className="space-y-6">
          {todayItems.length > 0 && (
            <section>
              <h2 className="mb-3 text-[17px] font-semibold tracking-tight text-ink">Today</h2>
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
                {todayItems.map(item => {
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
                         <p className="mt-1 truncate text-[14px] font-medium text-ink">{item.title}</p>
                         <p className="mt-0.5 truncate text-[12.5px] text-ink-subtle">{item.detail}</p>
                       </div>
                       {item.action && (
                         <Link
                           to={item.action.to}
                           className="group mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-control border border-line px-2.5 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                         >
                           {item.action.label}
                           <ArrowRight
                             className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
                             aria-hidden
                           />
                         </Link>
                       )}
                     </li>
                   )
                })}
              </ul>
            </section>
          )}
          
          {tomorrowItems.length > 0 && (
             <section>
               <h2 className="mb-3 text-[17px] font-semibold tracking-tight text-ink">Tomorrow</h2>
               <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
                 {tomorrowItems.map(item => {
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
                          <p className="mt-1 truncate text-[14px] font-medium text-ink">{item.title}</p>
                          <p className="mt-0.5 truncate text-[12.5px] text-ink-subtle">{item.detail}</p>
                        </div>
                        {item.action && (
                          <Link
                            to={item.action.to}
                            className="group mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-control border border-line px-2.5 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                          >
                            {item.action.label}
                            <ArrowRight
                              className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
                              aria-hidden
                            />
                          </Link>
                        )}
                      </li>
                    )
                 })}
               </ul>
             </section>
          )}
        </div>
      )}
    </PageContainer>
  )
}
