import { ChevronRight, MapPin, Paperclip } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { categoryShortLabel, complaintStages, stageShortLabel } from '@/data'
import { cn, formatRelative } from '@/lib/utils'
import type { Complaint, ComplaintStage } from '@/types'

const stageTone: Record<ComplaintStage, 'neutral' | 'info' | 'warn' | 'ok'> = {
  submitted: 'neutral',
  assigned: 'info',
  'technician-assigned': 'info',
  'in-progress': 'info',
  verification: 'warn',
  resolved: 'ok',
}

/** Six segments, one per lifecycle stage — progress without a percentage. */
function StageBar({ stage }: { stage: ComplaintStage }) {
  const index = complaintStages.indexOf(stage)
  const done = stage === 'resolved'

  return (
    <div className="flex gap-1" aria-hidden>
      {complaintStages.map((entry, i) => (
        <span
          key={entry}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors duration-300',
            i <= index ? (done ? 'bg-ok' : 'bg-brand') : 'bg-surface-muted',
          )}
        />
      ))}
    </div>
  )
}

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  return (
    <Link
      to={`/app/complaints/${complaint.id}`}
      className="press group block rounded-card border border-line bg-surface p-4 hover:border-line-strong sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11.5px] font-medium tabular-nums text-ink-subtle">
              {complaint.reference}
            </span>
            <Badge tone="outline">{categoryShortLabel[complaint.category]}</Badge>
          </div>
          <p className="mt-2 truncate text-[15px] font-medium text-ink">{complaint.title}</p>
        </div>

        <ChevronRight
          className="mt-1 size-4 shrink-0 text-ink-subtle transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-subtle">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" aria-hidden />
          {complaint.block} · {complaint.room}
        </span>
        {complaint.photoCount > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <Paperclip className="size-3.5" aria-hidden />
            {complaint.photoCount} photo{complaint.photoCount === 1 ? '' : 's'}
          </span>
        ) : null}
        <span>Updated {formatRelative(complaint.updatedAt)}</span>
      </div>

      <div className="mt-4">
        <StageBar stage={complaint.stage} />
        <div className="mt-2 flex items-center justify-between gap-3">
          <Badge tone={stageTone[complaint.stage]}>{stageShortLabel[complaint.stage]}</Badge>
          {complaint.assignee ? (
            <span className="truncate text-[12px] text-ink-subtle">{complaint.assignee.team}</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
