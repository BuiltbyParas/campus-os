import { Minus, Plus, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { DemoTag } from '@/components/ui/DemoTag'
import { courseById } from '@/data'
import { classesMustAttend, percentage } from '@/lib/attendance'
import { cn } from '@/lib/utils'
import type { AttendanceSummary } from '@/types'

const MAX_SKIPS = 4

/**
 * "What happens if I miss the next two?"
 *
 * The question every attendance screen leaves a student to work out on paper.
 * Answering it is the difference between reporting a number and being useful:
 * the projection uses the same arithmetic as the rest of the product, so it can
 * never disagree with the figure above it.
 *
 * Every projected value is explicitly an estimate against a demo threshold, and
 * says so — this must never read as an institutional ruling.
 */
export function AttendanceProjection({
  summary,
  className,
}: {
  summary: AttendanceSummary
  className?: string
}) {
  const [courseId, setCourseId] = useState(
    () => [...summary.courses].sort((a, b) => a.percentage - b.percentage)[0]?.courseId ?? '',
  )
  const [skips, setSkips] = useState(1)

  const row = summary.courses.find((entry) => entry.courseId === courseId)
  if (!row) return null

  const projected = percentage(row.attended, row.held + skips)
  const crosses = projected < row.requiredPercentage
  const alreadyBelow = row.percentage < row.requiredPercentage
  const recovery = classesMustAttend(row.attended, row.held + skips, row.requiredPercentage)

  /* Each step, so the student sees where the line is crossed rather than only
     the endpoint. */
  const steps = Array.from({ length: MAX_SKIPS + 1 }, (_, missed) => ({
    missed,
    value: percentage(row.attended, row.held + missed),
  }))

  return (
    <section className={cn('rounded-card border border-line bg-surface p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-ink">Plan ahead</h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            See what missing your next classes would do.
          </p>
        </div>
        <DemoTag title="Projected from demo attendance against a demo threshold" />
      </div>

      {/* course — underline tabs rather than pills, so the active course reads
          as a selected view rather than one more chip on the page */}
      <div
        role="radiogroup"
        aria-label="Course"
        className="mt-4 flex gap-1 overflow-x-auto border-b border-line scrollbar-none"
      >
        {summary.courses.map((entry) => {
          const course = courseById.get(entry.courseId)
          const active = entry.courseId === courseId
          return (
            <button
              key={entry.courseId}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setCourseId(entry.courseId)}
              className={cn(
                'relative shrink-0 px-3 pb-3 pt-2.5 text-[12.5px] font-medium transition-colors duration-200 sm:pb-2.5 sm:pt-1',
                active
                  ? 'text-ink'
                  : 'text-ink-subtle hover:bg-surface-raised/60 hover:text-ink',
              )}
            >
              {course?.short ?? 'Course'}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-0 -bottom-px h-[2px] rounded-full transition-colors duration-200',
                  active ? 'bg-brand' : 'bg-transparent',
                )}
              />
            </button>
          )
        })}
      </div>

      {/* stepper */}
      <div className="mt-5 flex items-center gap-4">
        <span className="text-[13.5px] text-ink-muted">Classes missed</span>
        <div className="flex items-center gap-1 rounded-control border border-line bg-surface-raised p-1">
          <button
            type="button"
            onClick={() => setSkips((value) => Math.max(0, value - 1))}
            disabled={skips === 0}
            aria-label="One fewer class missed"
            className="grid size-10 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface hover:text-ink disabled:pointer-events-none disabled:opacity-40 sm:size-8"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span
            className="w-7 text-center text-[15px] font-semibold tabular-nums text-ink"
            aria-live="polite"
          >
            {skips}
          </span>
          <button
            type="button"
            onClick={() => setSkips((value) => Math.min(MAX_SKIPS, value + 1))}
            disabled={skips === MAX_SKIPS}
            aria-label="One more class missed"
            className="grid size-10 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface hover:text-ink disabled:pointer-events-none disabled:opacity-40 sm:size-8"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* the projection itself */}
      <ol className="mt-5 grid gap-px overflow-hidden rounded-tile border border-line bg-line sm:grid-cols-5">
        {steps.map((step) => {
          const selected = step.missed === skips
          const below = step.value < row.requiredPercentage
          return (
            <li
              key={step.missed}
              className={cn(
                'bg-surface px-3 py-2.5 transition-colors duration-200 hover:bg-surface-raised',
                selected && 'bg-surface-raised',
              )}
            >
              <p className="text-[11px] text-ink-subtle">
                {step.missed === 0 ? 'Now' : `Miss ${step.missed}`}
              </p>
              <p
                className={cn(
                  'mt-1 text-[16px] font-semibold tabular-nums',
                  below ? 'text-danger-ink' : 'text-ink',
                )}
              >
                {Math.round(step.value)}%
              </p>
            </li>
          )
        })}
      </ol>

      <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted">
        {crosses ? (
          <TrendingDown className="mt-0.5 size-4 shrink-0 text-danger-ink" aria-hidden />
        ) : null}
        <span>
          {skips === 0 ? (
            alreadyBelow ? (
              <>
                You are already below the {row.requiredPercentage}% demo threshold. Attending the
                next {row.mustAttend} would bring you back.
              </>
            ) : (
              <>
                You have room to miss {row.canMiss} before reaching the {row.requiredPercentage}%
                demo threshold.
              </>
            )
          ) : crosses ? (
            <>
              Missing {skips} would put you at{' '}
              <span className="font-medium text-danger-ink">{Math.round(projected)}%</span>, below
              the {row.requiredPercentage}% demo threshold — you would then need{' '}
              {recovery} consecutive classes to recover.
            </>
          ) : (
            <>
              Missing {skips} would leave you at{' '}
              <span className="font-medium text-ink">{Math.round(projected)}%</span>, still above
              the {row.requiredPercentage}% demo threshold.
            </>
          )}
        </span>
      </p>

      <Link
        to={`/app/assistant?q=${encodeURIComponent(
          `Can I skip my next ${courseById.get(courseId)?.short ?? ''} class?`,
        )}`}
        className="tap mt-4 inline-flex text-[13px] font-medium text-brand-ink transition-colors hover:text-ink"
      >
        Ask CampusOS about this
      </Link>
    </section>
  )
}
