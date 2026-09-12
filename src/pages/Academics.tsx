import { Award, CheckCircle2, Circle, CircleDot, Clock3, FileText, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { CountUp } from '@/components/ui/CountUp'
import { DemoNote, DemoTag } from '@/components/ui/DemoTag'
import { MilestoneTrack, type Milestone } from '@/components/ui/MilestoneTrack'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { courseById } from '@/data'
import { DEMO_REVALUATION_WINDOW_DAYS, reachableRange, revaluationWindow } from '@/lib/results'
import { Meter } from '@/components/ui/Meter'
import { cn, formatDateLabel } from '@/lib/utils'
import { useEduProgress, useResults } from '@/services/queries'
import type { CourseResult, EduActivity, EduActivityStatus } from '@/types'

/**
 * Academics — how the semester is actually going.
 *
 * Three records that a portal would put behind three separate menu items live
 * on one screen, because a student reads them as one question: *am I doing all
 * right?* A mark is only meaningful next to what is still left to play for, and
 * a re-evaluation window is worthless on a page you have to know to visit —
 * it belongs beside the mark that would prompt it.
 */
export default function Academics() {
  const results = useResults()
  const edu = useEduProgress()

  const summary = results.data
  const ordered = summary ? [...summary.courses].sort((a, b) => a.percentage - b.percentage) : []

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Academics"
        description="Your marks so far, what is still assessable, and your EDU-Revolution progress."
        action={
          <Link
            to="/app/exams"
            className="press inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-medium text-ink hover:border-line-strong"
          >
            <FileText className="size-4 text-ink-subtle" aria-hidden />
            Exam schedule
          </Link>
        }
      />

      {/* --------------------------------------------------------- results */}
      {results.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-[132px] w-full rounded-card" />
          <div className="card-premium p-5">
            <SkeletonRows count={4} />
          </div>
        </div>
      ) : results.isError || !summary ? (
        <ErrorState
          title="Results are unavailable"
          description="We could not load your assessed work just now."
          onRetry={() => results.refetch()}
        />
      ) : summary.courses.length === 0 ? (
        <EmptyState
          title="Nothing published yet"
          description="Marks appear here as each assessment is released."
        />
      ) : (
        <>
          {/* overall — the figure the page is about, given hero treatment */}
          <section className="relative overflow-hidden card-premium p-5 sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-brand/12 blur-[80px]"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[17px] font-semibold tracking-tight text-ink">
                    Weighted average
                  </h2>
                  {summary.source === 'demo' ? <DemoTag /> : null}
                </div>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Across everything assessed so far — not a final grade.
                </p>
              </div>
              <p className="text-[48px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-ink sm:text-[56px]">
                <CountUp value={Math.round(summary.overallPercentage)} />
                <span className="text-[24px] text-ink-muted">%</span>
              </p>
            </div>

            {/* the bar carries the grade bands, so the number has somewhere to
                sit rather than floating on its own */}
            <div className="relative mt-5 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${Math.min(100, summary.overallPercentage)}%`,
                  background:
                    'linear-gradient(90deg, color-mix(in oklab, var(--brand) 55%, transparent), var(--brand))',
                }}
              />
            </div>
            <div className="relative mt-2 flex justify-between text-[10.5px] tabular-nums text-ink-subtle">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>

            {summary.latest ? (
              <p className="mt-5 border-t border-line pt-4 text-[13px] text-ink-muted">
                Most recently published:{' '}
                <span className="font-medium text-ink">
                  {courseById.get(summary.latest.courseId)?.name ?? 'A course'}
                </span>{' '}
                · {formatDateLabel(summary.latest.publishedAt.slice(0, 10))}
              </p>
            ) : null}
          </section>

          {/* per course */}
          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold tracking-tight text-ink">By course</h2>
            {ordered.map((result) => (
              <CourseCard key={result.courseId} result={result} />
            ))}
          </section>

          <DemoNote>
            Marks and the {DEMO_REVALUATION_WINDOW_DAYS}-day re-evaluation window are demo figures
            for this prototype. They are not an official academic record or an institutional
            deadline.
          </DemoNote>
        </>
      )}

      {/* -------------------------------------------------- EDU-Revolution */}
      <section className="card-premium p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="size-[18px] text-brand-ink" aria-hidden />
            <h2 className="text-[17px] font-semibold tracking-tight text-ink">EDU-Revolution</h2>
            {edu.data?.source === 'demo' ? <DemoTag /> : null}
          </div>
          {edu.data ? (
            <p className="text-[13px] tabular-nums text-ink-muted">
              <span className="font-semibold text-ink">{edu.data.completed}</span> of{' '}
              {edu.data.required} complete
            </p>
          ) : null}
        </div>

        {edu.isPending ? (
          <SkeletonRows count={3} />
        ) : edu.isError || !edu.data ? (
          <ErrorState
            title="Progress is unavailable"
            description="We could not load your co-curricular record just now."
            onRetry={() => edu.refetch()}
          />
        ) : (
          <>
            {/* The named path, not an anonymous bar: "in progress on the
                contribution sprint" is a different thing to know than "60%". */}
            <MilestoneTrack
              milestones={edu.data.activities.map<Milestone>((activity) => ({
                id: activity.id,
                label: activity.category,
                state:
                  activity.status === 'completed'
                    ? 'done'
                    : activity.status === 'in-progress'
                      ? 'current'
                      : 'todo',
              }))}
              tone={edu.data.completed >= edu.data.required ? 'ok' : 'brand'}
            />

            <ul className="mt-5 divide-y divide-line">
              {edu.data.activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </ul>

            {/* the next action, which is the whole point of showing progress */}
            {edu.data.nextRecommended ? (
              <div className="mt-5 rounded-tile border border-brand-border/50 bg-brand-soft/40 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-ink">
                  Do this next
                </p>
                <p className="mt-1.5 text-[14px] font-medium text-ink">
                  {edu.data.nextRecommended.title}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-ink-muted">
                  {edu.data.nextRecommended.detail}
                </p>
              </div>
            ) : (
              <p className="mt-5 text-[13px] text-ink-muted">
                All {edu.data.required} activities are complete.
              </p>
            )}
          </>
        )}
      </section>
    </PageContainer>
  )
}

/* ------------------------------------------------------------- course card */

/**
 * Grade bands.
 *
 * Thresholds are a **demo convention** for this prototype, not an institutional
 * grading scale — they exist so a weak component is visibly weak, and the page
 * says as much in its demo note.
 */
function gradeTone(percentage: number) {
  if (percentage >= 70) return 'text-ok-ink'
  if (percentage >= 50) return 'text-warn-ink'
  return 'text-danger-ink'
}

function gradeMeter(percentage: number): 'ok' | 'warn' | 'danger' {
  if (percentage >= 70) return 'ok'
  if (percentage >= 50) return 'warn'
  return 'danger'
}

function CourseCard({ result }: { result: CourseResult }) {
  const course = courseById.get(result.courseId)
  const range = reachableRange(result)
  const window = revaluationWindow(result)

  return (
    <article className="lift group card-premium p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-ink transition-colors duration-200 group-hover:text-brand-ink">
            {course?.name ?? 'Course'}
          </h3>
          <p className="mt-0.5 text-[12.5px] text-ink-subtle">
            {course?.code} · {Math.round(result.assessed)}% of the course assessed
          </p>
        </div>
        <p
          className={cn(
            'text-[22px] font-semibold leading-none tabular-nums transition-colors duration-200',
            gradeTone(result.percentage),
          )}
        >
          {Math.round(result.percentage)}%
        </p>
      </div>

      {/* assessments — each as a mini bar, colour-coded by band, so a weak
          component is visible without reading three numbers */}
      <ul className="mt-4 space-y-2.5">
        {result.assessments.map((assessment) => {
          const share = (assessment.score / assessment.maxScore) * 100
          return (
            <li key={assessment.id} className="rounded-tile bg-surface-muted/60 px-3 py-2.5">
              <div className="flex items-center justify-between gap-4">
                <span className="min-w-0 truncate text-[13px] text-ink">{assessment.name}</span>
                <span className="shrink-0 text-[13px] tabular-nums text-ink-muted">
                  <span className={cn('font-medium', gradeTone(share))}>{assessment.score}</span>
                  <span className="text-ink-subtle">/{assessment.maxScore}</span>
                  <span className="ml-2 text-[11.5px] text-ink-subtle">
                    {assessment.weight}% weight
                  </span>
                </span>
              </div>
              <Meter
                value={share}
                tone={gradeMeter(share)}
                size="sm"
                label={`${assessment.name}: ${assessment.score} of ${assessment.maxScore}`}
                className="mt-2"
              />
            </li>
          )
        })}
      </ul>

      {/* what is still reachable — the honest way to read a mid-semester mark */}
      {result.remainingWeight > 0 ? (
        <p className="mt-4 text-[12.5px] leading-snug text-ink-muted">
          {Math.round(result.remainingWeight)}% of this course is still unassessed. As it stands you
          can still finish between{' '}
          <span className="font-medium tabular-nums text-ink">{Math.round(range.worst)}%</span> and{' '}
          <span className="font-medium tabular-nums text-ink">{Math.round(range.best)}%</span>.
        </p>
      ) : null}

      {/* re-evaluation, placed beside the mark that would prompt it */}
      {window.open ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-[12.5px] text-ink-muted">
            <Clock3 className="mr-1.5 inline size-3.5 -translate-y-px text-ink-subtle" aria-hidden />
            Re-evaluation closes in {window.daysLeft}{' '}
            {window.daysLeft === 1 ? 'day' : 'days'} · {formatDateLabel(window.closesOn)}
          </p>
          <Link
            to={`/app/assistant?q=${encodeURIComponent(
              `Should I apply for re-evaluation in ${course?.short ?? 'this course'}?`,
            )}`}
            className="press inline-flex h-10 shrink-0 items-center gap-1.5 rounded-control border border-line bg-surface px-3 text-[12.5px] font-medium text-ink hover:border-line-strong sm:h-8"
          >
            <Sparkles className="size-3.5 text-brand-ink" aria-hidden />
            Ask CampusOS
          </Link>
        </div>
      ) : null}
    </article>
  )
}

/* --------------------------------------------------------------- activity */

const activityIcon: Record<EduActivityStatus, typeof Circle> = {
  completed: CheckCircle2,
  'in-progress': CircleDot,
  pending: Circle,
}

const activityTone: Record<EduActivityStatus, string> = {
  completed: 'text-ok',
  'in-progress': 'text-brand',
  pending: 'text-ink-subtle',
}

function ActivityRow({ activity }: { activity: EduActivity }) {
  const Icon = activityIcon[activity.status]
  return (
    <li className="flex items-start gap-3 py-3">
      <Icon className={cn('mt-0.5 size-4 shrink-0', activityTone[activity.status])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-ink">{activity.title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{activity.detail}</p>
      </div>
      <span className="shrink-0 text-[11.5px] text-ink-subtle">
        {activity.status === 'completed' && activity.completedOn
          ? formatDateLabel(activity.completedOn)
          : activity.category}
      </span>
    </li>
  )
}
