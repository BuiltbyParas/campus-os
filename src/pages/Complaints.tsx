import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ComplaintCard } from '@/components/app/ComplaintCard'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { useComplaints } from '@/services/queries'

type Filter = 'open' | 'resolved' | 'all'

export default function Complaints() {
  const [filter, setFilter] = useState<Filter>('open')
  const complaints = useComplaints({ status: filter })

  /* Counts come from the unfiltered list so the tabs do not flicker as the
     active filter refetches. */
  const all = useComplaints({ status: 'all' })
  const openCount = (all.data ?? []).filter((item) => item.stage !== 'resolved').length
  const resolvedCount = (all.data ?? []).filter((item) => item.stage === 'resolved').length

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Complaints"
        description="Issues you have reported, and where each one has reached."
        action={
          <Link
            to="/app/complaints/new"
            className="press inline-flex h-11 items-center gap-2 rounded-control bg-brand px-4 text-[14px] font-medium text-on-brand hover:bg-brand-hover"
          >
            <Plus className="size-4" aria-hidden />
            Report an issue
          </Link>
        }
      />

      <Tabs
        label="Filter requests"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: 'Open', count: openCount },
          { value: 'resolved', label: 'Resolved', count: resolvedCount },
          { value: 'all', label: 'All' },
        ]}
      />

      {complaints.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : complaints.isError ? (
        <ErrorState
          title="Requests are unavailable"
          description="We could not load your reported issues just now."
          onRetry={() => complaints.refetch()}
        />
      ) : (complaints.data ?? []).length === 0 ? (
        <EmptyState
          title={filter === 'resolved' ? 'Nothing resolved yet' : 'No open requests'}
          description={
            filter === 'resolved'
              ? 'Requests move here once they are closed.'
              : 'Report a problem with your room, a lab or a shared space and track it through to resolution.'
          }
          action={
            filter !== 'resolved' ? (
              <Link
                to="/app/complaints/new"
                className="press inline-flex h-10 items-center gap-2 rounded-control bg-brand px-4 text-[14px] font-medium text-on-brand hover:bg-brand-hover"
              >
                <Plus className="size-4" aria-hidden />
                Report an issue
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(complaints.data ?? []).map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
