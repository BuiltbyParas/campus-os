import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

export type MilestoneState = 'done' | 'current' | 'todo'

export interface Milestone {
  id: string
  label: string
  detail?: string
  state: MilestoneState
}

/**
 * A path through named stages, laid out horizontally.
 *
 * The complement to a progress bar: a bar says *how far*, this says *where* —
 * which matters when the stages have names a student is waiting on ("technician
 * assigned" is a different feeling from "submitted"). Future stages stay
 * visible rather than hidden, so the whole journey is legible from the first
 * step and nobody has to wonder how much is left.
 *
 * The current node pulses, and only the current node: one moving thing on a
 * screen reads as *this is where you are*, several read as decoration.
 *
 * Scrolls horizontally when the path is longer than the space — the alternative
 * is shrinking labels until they are unreadable.
 */
export function MilestoneTrack({
  milestones,
  tone = 'brand',
  className,
}: {
  milestones: Milestone[]
  /** `ok` once the path is complete, so a finished journey reads as finished. */
  tone?: 'brand' | 'ok'
  className?: string
}) {
  const accent = tone === 'ok' ? 'bg-ok' : 'bg-brand'
  const accentBorder = tone === 'ok' ? 'border-ok' : 'border-brand'
  const accentText = tone === 'ok' ? 'text-ok-ink' : 'text-brand-ink'

  return (
    <ol
      className={cn('flex min-w-0 gap-0 overflow-x-auto pb-1 scrollbar-none', className)}
      aria-label="Progress"
    >
      {milestones.map((milestone, index) => {
        const last = index === milestones.length - 1
        const done = milestone.state === 'done'
        const current = milestone.state === 'current'

        return (
          <li
            key={milestone.id}
            className={cn('relative flex min-w-[86px] flex-1 flex-col items-center', !last && 'pr-1')}
            aria-current={current ? 'step' : undefined}
          >
            {/* the rail to the next node */}
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  'absolute left-1/2 top-[13px] h-0.5 w-full transition-colors duration-500',
                  done ? accent : 'bg-line',
                )}
              />
            ) : null}

            <span
              aria-hidden
              className={cn(
                'relative z-10 grid size-[27px] shrink-0 place-items-center rounded-full border-2 transition-colors duration-300',
                done && cn(accentBorder, accent, 'text-on-brand'),
                current && cn(accentBorder, 'bg-canvas'),
                milestone.state === 'todo' && 'border-line bg-canvas',
              )}
            >
              {done ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : current ? (
                <>
                  <span
                    className={cn(
                      'absolute inset-0 rounded-full opacity-50 [animation:pulse-ring_2.4s_ease-out_infinite]',
                      accent,
                    )}
                  />
                  <span className={cn('relative size-2 rounded-full', accent)} />
                </>
              ) : (
                <span className="size-1.5 rounded-full bg-line-strong" />
              )}
            </span>

            <span
              className={cn(
                'mt-2 text-center text-[11px] font-medium leading-tight',
                current ? accentText : done ? 'text-ink' : 'text-ink-subtle',
              )}
            >
              {milestone.label}
            </span>

            {milestone.detail ? (
              <span className="mt-0.5 text-center text-[10.5px] leading-tight text-ink-subtle">
                {milestone.detail}
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
