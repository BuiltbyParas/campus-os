import { Check } from 'lucide-react'

import { complaintStages, stageLabel } from '@/data'
import { cn, formatRelative } from '@/lib/utils'
import type { Complaint } from '@/types'

/**
 * The lifecycle of one request, as a vertical trail.
 *
 * Stages the request has passed through carry their real timestamp and a plain
 * sentence describing what happened; stages still ahead are shown greyed so the
 * student can see the whole path rather than only where they are.
 */
export function ComplaintTracker({ complaint }: { complaint: Complaint }) {
  const currentIndex = complaintStages.indexOf(complaint.stage)
  const entryByStage = new Map(complaint.timeline.map((entry) => [entry.stage, entry]))

  return (
    <ol className="relative">
      {complaintStages.map((stage, index) => {
        const entry = entryByStage.get(stage)
        const done = index < currentIndex
        const current = index === currentIndex
        const future = index > currentIndex
        const last = index === complaintStages.length - 1

        return (
          <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connector */}
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px',
                  done ? 'bg-brand/40' : 'bg-line',
                )}
              />
            ) : null}

            <span
              aria-hidden
              className={cn(
                'relative z-10 mt-0.5 grid size-[27px] shrink-0 place-items-center rounded-full border',
                done && 'border-brand/40 bg-brand-soft text-brand-ink',
                current && 'border-brand bg-brand text-on-brand',
                future && 'border-line bg-surface text-ink-subtle',
              )}
            >
              {done ? (
                <Check className="size-3.5" />
              ) : (
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    current ? 'bg-on-brand' : 'bg-ink-subtle/50',
                  )}
                />
              )}
            </span>

            <div className={cn('min-w-0 flex-1 pt-0.5', future && 'opacity-45')}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p
                  className={cn(
                    'text-[14px]',
                    current ? 'font-semibold text-ink' : 'font-medium text-ink',
                  )}
                >
                  {stageLabel[stage]}
                </p>
                {entry ? (
                  <time
                    dateTime={entry.timestamp}
                    className="text-[12px] tabular-nums text-ink-subtle"
                  >
                    {formatRelative(entry.timestamp)}
                  </time>
                ) : null}
              </div>

              {entry ? (
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                  {entry.description}
                </p>
              ) : (
                <p className="mt-1 text-[13px] text-ink-subtle">Not yet reached</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
