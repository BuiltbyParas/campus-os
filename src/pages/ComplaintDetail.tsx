import { ArrowLeft, Check, Loader2, MapPin, Paperclip, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ComplaintTracker } from '@/components/app/ComplaintTracker'
import { PageContainer } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/Badge'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { categoryLabel, priorityLabel, stageLabel } from '@/data'
import { useToast } from '@/components/ui/Toast'
import { formatRelative } from '@/lib/utils'
import { useComplaint } from '@/services/queries'

export default function ComplaintDetail() {
  const { id = '' } = useParams()
  const complaint = useComplaint(id)
  const toast = useToast()

  /* The verification step is the one place the student closes the loop, so it
     has to actually do something. There is no backend yet, so the outcome is
     held locally and the UI says plainly that it was recorded for the demo. */
  const [verdict, setVerdict] = useState<'confirmed' | 'reopened' | null>(null)
  const [submitting, setSubmitting] = useState<'confirmed' | 'reopened' | null>(null)

  function respond(next: 'confirmed' | 'reopened') {
    setSubmitting(next)
    window.setTimeout(() => {
      setSubmitting(null)
      setVerdict(next)
      if (next === 'confirmed') {
        toast.success('Marked as fixed', 'Thanks — this request is now closed.')
      } else {
        toast.info('Reopened', 'Campus services will take another look.')
      }
    }, 600)
  }

  if (complaint.isPending) {
    return (
      <PageContainer width="narrow" className="space-y-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-2/3" />
        <div className="rounded-card border border-line bg-surface p-5">
          <SkeletonRows count={5} />
        </div>
      </PageContainer>
    )
  }

  if (complaint.isError) {
    return (
      <PageContainer width="narrow">
        <ErrorState
          title="Request is unavailable"
          description="We could not load this request just now."
          onRetry={() => complaint.refetch()}
        />
      </PageContainer>
    )
  }

  const data = complaint.data
  if (!data) {
    return (
      <PageContainer width="narrow">
        <EmptyState
          title="Request not found"
          description="This request may have been removed, or the link is wrong."
          action={
            <Link
              to="/app/complaints"
              className="press inline-flex h-10 items-center rounded-control bg-brand px-4 text-[14px] font-medium text-on-brand hover:bg-brand-hover"
            >
              Back to complaints
            </Link>
          }
        />
      </PageContainer>
    )
  }

  const awaitingStudent = data.stage === 'verification'
  const resolved = data.stage === 'resolved'

  return (
    <PageContainer width="narrow" className="space-y-6">
      {/* ------------------------------------------------------------ header */}
      <div>
        <Link
          to="/app/complaints"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Complaints
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-medium tabular-nums text-ink-subtle">
            {data.reference}
          </span>
          <Badge tone="outline">{categoryLabel[data.category]}</Badge>
          <Badge tone={data.priority === 'high' ? 'danger' : 'neutral'}>
            {priorityLabel[data.priority]} priority
          </Badge>
        </div>

        <h1 className="mt-2.5 text-[24px] font-semibold tracking-tight text-ink sm:text-[30px]">
          {data.title}
        </h1>

        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-muted">{data.description}</p>

        <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-subtle">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Location</dt>
            <MapPin className="size-3.5" aria-hidden />
            <dd>
              {data.block} · {data.room}
            </dd>
          </div>
          {data.assignee ? (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Assigned to</dt>
              <User className="size-3.5" aria-hidden />
              <dd>
                {data.assignee.name} · {data.assignee.team}
              </dd>
            </div>
          ) : null}
          {data.photoCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Attachments</dt>
              <Paperclip className="size-3.5" aria-hidden />
              <dd>
                {data.photoCount} photo{data.photoCount === 1 ? '' : 's'}
              </dd>
            </div>
          ) : null}
          <div>Reported {formatRelative(data.createdAt)}</div>
        </dl>
      </div>

      {/* ---------------------------------------------------- current status */}
      <section
        className={
          resolved
            ? 'rounded-card border border-ok/25 bg-ok-soft/30 p-5'
            : awaitingStudent
              ? 'rounded-card border border-warn/25 bg-warn-soft/30 p-5'
              : 'rounded-card border border-line bg-surface p-5'
        }
      >
        <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-ink-subtle">
          Current status
        </p>
        <p className="mt-1.5 text-[17px] font-semibold tracking-tight text-ink">
          {stageLabel[data.stage]}
        </p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
          {data.timeline[data.timeline.length - 1]?.description}
        </p>

        {awaitingStudent && !verdict ? (
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => respond('confirmed')}
              disabled={submitting !== null}
              className="press inline-flex h-10 items-center justify-center gap-2 rounded-control bg-brand px-4 text-[13.5px] font-medium text-on-brand hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-60"
            >
              {submitting === 'confirmed' ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Check className="size-4" aria-hidden />
              )}
              Confirm it’s fixed
            </button>
            <button
              type="button"
              onClick={() => respond('reopened')}
              disabled={submitting !== null}
              className="press inline-flex h-10 items-center justify-center gap-2 rounded-control border border-line bg-surface px-4 text-[13.5px] font-medium text-ink hover:border-line-strong disabled:pointer-events-none disabled:opacity-60"
            >
              {submitting === 'reopened' ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Still a problem
            </button>
          </div>
        ) : verdict ? (
          <p
            className="mt-4 inline-flex items-center gap-2 rounded-control border border-line bg-surface px-3 py-2 text-[13px] text-ink-muted"
            role="status"
          >
            <Check className="size-4 shrink-0 text-ok" aria-hidden />
            {verdict === 'confirmed'
              ? 'You confirmed this is fixed. Recorded for the demo only.'
              : 'You reported this is still a problem. Recorded for the demo only.'}
          </p>
        ) : null}
      </section>

      {/* --------------------------------------------------------- tracking */}
      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <h2 className="mb-5 text-[17px] font-semibold tracking-tight text-ink">Progress</h2>
        <ComplaintTracker complaint={data} />
      </section>

      <Link
        to={`/app/assistant?q=${encodeURIComponent('Any update on my complaints?')}`}
        className="press inline-flex items-center gap-2 rounded-control border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-ink hover:border-line-strong"
      >
        <Sparkles className="size-3.5 text-brand-ink" aria-hidden />
        Ask the assistant about your requests
      </Link>

      <p className="text-[12.5px] text-ink-subtle">
        Demo request — the timeline above is sample data, not a live campus services record.
      </p>
    </PageContainer>
  )
}
