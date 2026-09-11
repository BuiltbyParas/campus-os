import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { Signal, SignalTone } from '@/types'

const tone = {
  info: { rail: 'bg-info', text: 'text-info-ink', soft: 'bg-info-soft', Icon: Info },
  ok: { rail: 'bg-ok', text: 'text-ok-ink', soft: 'bg-ok-soft', Icon: CheckCircle2 },
  warn: { rail: 'bg-warn', text: 'text-warn-ink', soft: 'bg-warn-soft', Icon: Clock3 },
  danger: { rail: 'bg-danger', text: 'text-danger-ink', soft: 'bg-danger-soft', Icon: AlertTriangle },
} as const satisfies Record<SignalTone, unknown>

const sourceLabel: Record<Signal['source'], string> = {
  attendance: 'Attendance',
  timetable: 'Timetable',
  complaint: 'Service',
  deadline: 'Coursework',
  event: 'Event',
  fee: 'Finance',
  result: 'Marks',
  edu: 'EDU-Revolution',
  exam: 'Examination',
}

/** Plain words for the priority, so colour is never the only signal. */
const priorityWord: Record<SignalTone, string> = {
  danger: 'High priority',
  warn: 'Needs attention',
  info: 'For information',
  ok: 'On track',
}

/**
 * What needs the student, ranked.
 *
 * Three identically-weighted alert rows tell a student that everything matters
 * equally, which is the same as telling them nothing does. This stack takes a
 * position: the single most urgent signal is rendered at full size with its
 * figure as the headline, and the rest fall in beneath as a compact list.
 *
 * The lead item leans on `metric` — "72%", "₹18,500", "6d" — because a number
 * set large is read before any sentence next to it. Signals without a figure
 * fall back to their title and simply read as a statement.
 */
export function AttentionStack({
  signals,
  limit = 4,
  className,
}: {
  signals: Signal[]
  limit?: number
  className?: string
}) {
  const shown = signals.slice(0, limit)

  if (shown.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-4',
          className,
        )}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ok-soft">
          <CheckCircle2 className="size-4 text-ok-ink" aria-hidden />
        </span>
        <div>
          <p className="text-[13.5px] font-medium text-ink">All clear</p>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">
            Nothing needs your attention right now.
          </p>
        </div>
      </div>
    )
  }

  const [lead, ...rest] = shown
  const leadTone = tone[lead.tone]

  return (
    <div className={cn('min-w-0', className)}>
      {/* ------------------------------------------------------------- lead */}
      <article className="relative overflow-hidden rounded-card border border-line bg-surface">
        <span aria-hidden className={cn('absolute inset-x-0 top-0 h-[3px]', leadTone.rail)} />
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-16 -top-20 size-56 rounded-full opacity-40 blur-[70px]',
            leadTone.rail,
          )}
        />

        <div className="relative p-5">
          <div className="flex items-center gap-2">
            <span className={cn('grid size-6 place-items-center rounded-full', leadTone.soft)}>
              <leadTone.Icon className={cn('size-3.5', leadTone.text)} aria-hidden />
            </span>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              {sourceLabel[lead.source]}
            </p>
            <span className={cn('text-[10.5px] font-semibold', leadTone.text)}>
              · {priorityWord[lead.tone]}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            {lead.metric ? (
              <p
                className={cn(
                  'text-[38px] font-semibold leading-none tracking-[-0.03em] tabular-nums',
                  leadTone.text,
                )}
              >
                {lead.metric}
              </p>
            ) : null}
            <p
              className={cn(
                'min-w-0 font-semibold leading-snug text-ink',
                lead.metric ? 'text-[15px]' : 'text-[19px]',
              )}
            >
              {lead.title}
            </p>
          </div>

          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{lead.detail}</p>

          {lead.action ? (
            <Link
              to={lead.action.to}
              className="press mt-4 inline-flex h-9 items-center gap-1.5 rounded-control bg-brand px-3.5 text-[13px] font-medium text-on-brand hover:bg-brand-hover"
            >
              {lead.action.label}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      </article>

      {/* ------------------------------------------------------------- rest */}
      {rest.length > 0 ? (
        <ul className="mt-2 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {rest.map((signal) => {
            const style = tone[signal.tone]
            return (
              <li key={signal.id}>
                <Link
                  to={signal.action?.to ?? '#'}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-raised"
                >
                  <span aria-hidden className={cn('h-8 w-[3px] shrink-0 rounded-full', style.rail)} />

                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                      {sourceLabel[signal.source]}
                    </span>
                    <span className="mt-0.5 block truncate text-[13.5px] font-medium text-ink">
                      {signal.title}
                    </span>
                  </span>

                  {signal.metric ? (
                    <span
                      className={cn(
                        'shrink-0 text-[15px] font-semibold tabular-nums',
                        style.text,
                      )}
                    >
                      {signal.metric}
                    </span>
                  ) : null}

                  <ArrowRight
                    className="size-3.5 shrink-0 text-ink-subtle transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
