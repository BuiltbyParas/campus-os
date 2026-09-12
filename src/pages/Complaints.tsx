import { ArrowRight, MapPin, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ComplaintCard } from '@/components/app/ComplaintCard'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { MilestoneTrack, type Milestone } from '@/components/ui/MilestoneTrack'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { complaintStages, stageLabel, stageShortLabel } from '@/data'
import { formatRelative } from '@/lib/utils'
import { useComplaints } from '@/services/queries'
import type { Complaint } from '@/types'

type Filter = 'open' | 'resolved' | 'all'

/**
 * The request a student is actually waiting on.
 *
 * A list of cards makes them hunt for it. This lifts the most recently updated
 * open request to the top of the screen and draws its whole journey, so the
 * question that brought them here — *has anything happened yet?* — is answered
 * before they read a word.
 */
function ActiveComplaint({ complaint }: { complaint: Complaint }) {
  const currentIndex = complaintStages.indexOf(complaint.stage)
  const entryByStage = new Map(complaint.timeline.map((entry) => [entry.stage, entry]))
  const last = complaint.timeline[complaint.timeline.length - 1]
  const resolved = complaint.stage === 'resolved'

  const milestones: Milestone[] = complaintStages.map((stage, index) => ({
    id: stage,
    label: stageShortLabel[stage],
    detail: entryByStage.has(stage)
      ? formatRelative(entryByStage.get(stage)!.timestamp)
      : undefined,
    state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo',
  }))

  return (
    <section className="relative overflow-hidden rounded-card border border-line bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-brand/12 blur-[90px]"
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              {resolved ? 'Most recent request' : 'Active request'}
            </p>
            <h2 className="mt-2 text-[22px] font-semibold leading-tight tracking-tight text-ink sm:text-[26px]">
              {complaint.title}
            </h2>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
              <span className="tabular-nums">{complaint.reference}</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-ink-subtle" aria-hidden />
                {complaint.block} · {complaint.room}
              </span>
            </p>
          </div>

          <Link
            to={`/app/complaints/${complaint.id}`}
            className="press group inline-flex h-11 shrink-0 items-center gap-1.5 rounded-control border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:border-line-strong sm:h-9"
          >
            Track request
            <ArrowRight
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>

        {/* the journey */}
        <div className="mt-6">
          <MilestoneTrack milestones={milestones} tone={resolved ? 'ok' : 'brand'} />
        </div>

        {/* what actually last happened, in plain words */}
        {last ? (
          <p className="mt-5 border-t border-line pt-4 text-[13px] leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">{stageLabel[complaint.stage]}</span>
            {' · '}
            {last.description}
            <span className="text-ink-subtle"> · {formatRelative(last.timestamp)}</span>
          </p>
        ) : null}
      </div>
    </section>
  )
}

export default function Complaints() {
  const [filter, setFilter] = useState<Filter>('open')
  const complaints = useComplaints({ status: filter })

  /* Counts come from the unfiltered list so the tabs do not flicker as the
     active filter refetches. */
  const all = useComplaints({ status: 'all' })
  const openCount = (all.data ?? []).filter((item) => item.stage !== 'resolved').length
  const resolvedCount = (all.data ?? []).filter((item) => item.stage === 'resolved').length

  /* The list arrives sorted by most recently updated, so the first open request
     is the one that moved last — the one a student came here to check. Falling
     back to the newest resolved one keeps the hero from vanishing on a student
     with nothing outstanding. */
  const featured =
    (all.data ?? []).find((item) => item.stage !== 'resolved') ?? (all.data ?? [])[0]

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

      {all.isPending ? (
        <Skeleton className="h-[232px] w-full rounded-card" />
      ) : featured ? (
        <ActiveComplaint complaint={featured} />
      ) : null}

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
