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
          'flex items-center gap-3 card-premium px-4 py-4',
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
      <article className="lift group relative overflow-hidden card-premium">
        {/* The rail thickens on hover rather than changing colour — the colour
            already means something, so it must not move. */}
        <span
          aria-hidden
          className={cn(
            'absolute inset-y-0 left-0 w-[3px] transition-[width] duration-200 group-hover:w-[4px]',
            leadTone.rail,
          )}
        />
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-16 -top-20 size-56 rounded-full opacity-40 blur-[70px]',
            leadTone.rail,
          )}
        />

        <div className="relative p-5 pl-6">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'grid size-10 place-items-center rounded-full transition-transform duration-200 group-hover:scale-110',
                leadTone.soft,
              )}
            >
              <leadTone.Icon className={cn('size-[18px]', leadTone.text)} aria-hidden />
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
              className="tap mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-ink decoration-brand-ink/50 underline-offset-4 transition-[color,text-decoration-color] duration-150 hover:text-brand hover:underline"
            >
              {lead.action.label}
              <ArrowRight
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          ) : null}
        </div>
      </article>

      {/* ------------------------------------------------------------- rest */}
      {rest.length > 0 ? (
        <ul className="mt-2 divide-y divide-line overflow-hidden card-premium">
          {rest.map((signal) => {
            const style = tone[signal.tone]
            return (
              <li key={signal.id}>
                <Link
                  to={signal.action?.to ?? '#'}
                  className="group flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-brand/[0.05]"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'h-9 w-[3px] shrink-0 rounded-full transition-[width] duration-200 group-hover:w-[4px]',
                      style.rail,
                    )}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                      {sourceLabel[signal.source]}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-[13.5px] font-medium text-ink sm:line-clamp-1">
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
