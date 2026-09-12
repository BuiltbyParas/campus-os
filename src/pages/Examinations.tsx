import { Armchair, CalendarClock, Info, MapPin, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ExamCountdown } from '@/components/app/ExamCountdown'
import { SeatMap } from '@/components/app/SeatMap'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Meter } from '@/components/ui/Meter'
import { DemoNote } from '@/components/ui/DemoTag'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { courseById } from '@/data'
import {
  DEMO_SEATING_RELEASE_DAYS,
  examDurationMinutes,
  examKindLabel,
  examTone,
  formatDuration,
} from '@/lib/exams'
import { cn, daysUntil, formatDateLabel, formatTime } from '@/lib/utils'
import { useAttendance, useExams, useResults } from '@/services/queries'
import type { AttendanceSummary, Exam, ResultsSummary } from '@/types'

const toneRing: Record<'info' | 'warn' | 'danger', string> = {
  info: 'border-line',
  warn: 'border-warn-soft',
  danger: 'border-danger-soft',
}

const toneChip: Record<'info' | 'warn' | 'danger', string> = {
  info: 'bg-surface-muted text-ink-muted',
  warn: 'bg-warn-soft text-warn-ink',
  danger: 'bg-danger-soft text-danger-ink',
}

/** "in 6 days" / "Tomorrow" / "Today" — the phrasing a student uses. */
function whenLabel(exam: Exam, at = new Date()) {
  const days = daysUntil(exam.date, at)
  if (days < 0) return 'Finished'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

/**
 * Examinations.
 *
 * The schedule and the seating plan are one screen because they are one
 * question: *when is it, and where do I sit?* A portal that files those under
 * separate menu items makes the student assemble the answer themselves, twice,
 * on the morning it matters most.
 *
 * Seating is released after the schedule, so a paper without an allocation says
 * so plainly rather than showing an empty row.
 */
export default function Examinations() {
  const exams = useExams()
  const attendance = useAttendance()
  const results = useResults()
  const schedule = exams.data
  const now = new Date()

  const upcoming = schedule?.exams.filter((exam) => daysUntil(exam.date, now) >= 0) ?? []
  const past = schedule?.exams.filter((exam) => daysUntil(exam.date, now) < 0) ?? []

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Examinations"
        description="Your papers, when they run, and where you sit."
      />

      {exams.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-[188px] w-full rounded-card" />
          <div className="card-premium p-5">
            <SkeletonRows count={4} />
          </div>
        </div>
      ) : exams.isError || !schedule ? (
        <ErrorState
          title="The exam schedule is unavailable"
          description="We could not load your examination schedule just now."
          onRetry={() => exams.refetch()}
        />
      ) : schedule.exams.length === 0 ? (
        <EmptyState
          title="No examinations scheduled"
          description="Papers appear here as soon as the schedule is published."
        />
      ) : (
        <>
          {/* ------------------------------------------------------ next up */}
          {schedule.next ? (
            <NextExam
              exam={schedule.next}
              at={now}
              attendance={attendance.data}
              results={results.data}
            />
          ) : null}

          {/* ----------------------------------------------------- schedule */}
          <section>
            <div className="mb-3 flex items-end justify-between gap-4">
              <h2 className="text-[17px] font-semibold tracking-tight text-ink">
                {upcoming.length > 0 ? 'All papers' : 'Papers'}
              </h2>
              <p className="shrink-0 text-[12.5px] text-ink-subtle">
                Seats released for {schedule.seatsPublished} of {schedule.exams.length}
              </p>
            </div>

            <ul className="space-y-3">
              {upcoming.map((exam) => (
                <li key={exam.id}>
                  <ExamCard exam={exam} at={now} />
                </li>
              ))}
            </ul>
          </section>

          {past.length > 0 ? (
            <section>
              <h2 className="mb-3 text-[17px] font-semibold tracking-tight text-ink">Finished</h2>
              <ul className="space-y-3 opacity-70">
                {past.map((exam) => (
                  <li key={exam.id}>
                    <ExamCard exam={exam} at={now} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <DemoNote>
            Fictional examination dates, rooms and seat allocations created for this prototype —
            including the {DEMO_SEATING_RELEASE_DAYS}-day seating release window. They are not an
            official schedule or seating plan and must not be relied on.
          </DemoNote>
        </>
      )}
    </PageContainer>
  )
}

/* ---------------------------------------------------------------- next up */

function NextExam({
  exam,
  at,
  attendance,
  results,
}: {
  exam: Exam
  at: Date
  attendance?: AttendanceSummary
  results?: ResultsSummary
}) {
  const course = courseById.get(exam.courseId)
  const tone = examTone(exam, at)

  /* Readiness is assembled from records the student already has — attendance
     in this course and their assessed marks in it. Nothing is predicted and
     nothing is scored: these are two existing figures placed next to the date
     they now matter for. */
  const courseAttendance = attendance?.courses.find((row) => row.courseId === exam.courseId)
  const courseResult = results?.courses.find((row) => row.courseId === exam.courseId)

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-card border bg-surface',
        toneRing[tone],
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/[0.07] via-transparent to-transparent" />
        <div className="absolute -right-24 -top-32 size-[420px] rounded-full bg-brand/14 blur-[100px]" />
      </div>

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
        {/* ------------------------------------------------------ countdown */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              Next paper
            </p>
            <span
              className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', toneChip[tone])}
            >
              {whenLabel(exam, at)}
            </span>
          </div>

          <h2 className="mt-2.5 text-[24px] font-semibold leading-tight tracking-tight text-ink sm:text-[30px]">
            {course?.name ?? 'Examination'}
          </h2>

          <div className="mt-5">
            <ExamCountdown exam={exam} />
          </div>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-[13.5px]">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-subtle">When</dt>
              <dd className="mt-1 text-ink">
                {formatDateLabel(exam.date)} · {formatTime(exam.startTime)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-subtle">Runs</dt>
              <dd className="mt-1 text-ink">
                {formatDuration(examDurationMinutes(exam))}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-subtle">Type</dt>
              <dd className="mt-1 text-ink">{examKindLabel[exam.kind]}</dd>
            </div>
          </dl>

          {/* readiness — two real figures, no invented score */}
          {courseAttendance || courseResult ? (
            <div className="mt-6 space-y-3 border-t border-line pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Where you stand in this course
              </p>

              {courseAttendance ? (
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[12.5px] text-ink-muted">Attendance</span>
                    <span className="text-[13px] font-semibold tabular-nums text-ink">
                      {Math.round(courseAttendance.percentage)}%
                    </span>
                  </div>
                  <Meter
                    value={courseAttendance.percentage}
                    threshold={courseAttendance.requiredPercentage}
                    tone={
                      courseAttendance.status === 'below'
                        ? 'danger'
                        : courseAttendance.status === 'at-risk'
                          ? 'warn'
                          : 'ok'
                    }
                    size="sm"
                    label={`${course?.short ?? 'Course'} attendance`}
                    className="mt-1.5"
                  />
                </div>
              ) : null}

              {courseResult ? (
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[12.5px] text-ink-muted">
                      Marks so far ({Math.round(courseResult.assessed)}% assessed)
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums text-ink">
                      {Math.round(courseResult.percentage)}%
                    </span>
                  </div>
                  <Meter
                    value={courseResult.percentage}
                    tone={courseResult.percentage < 50 ? 'danger' : courseResult.percentage < 65 ? 'warn' : 'ok'}
                    size="sm"
                    label={`${course?.short ?? 'Course'} marks`}
                    className="mt-1.5"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to={`/app/assistant?q=${encodeURIComponent(
                `What should I revise for my ${course?.short ?? ''} exam?`.replace('  ', ' '),
              )}`}
              className="press inline-flex h-11 items-center gap-1.5 rounded-control border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:border-line-strong sm:h-9"
            >
              <Sparkles className="size-3.5 text-brand-ink" aria-hidden />
              Ask CampusOS
            </Link>
            <Link
              to="/app/academics"
              className="press inline-flex h-11 items-center rounded-control border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:border-line-strong sm:h-9"
            >
              View marks
            </Link>
          </div>
        </div>

        {/* ----------------------------------------------------------- seat */}
        <div className="lg:border-l lg:border-line lg:pl-10">
          {exam.seat ? (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink">
                  <Armchair className="size-3.5" aria-hidden />
                  Your seat
                </p>
                <p className="text-[22px] font-semibold leading-none tabular-nums text-ink">
                  {exam.seat.seat}
                </p>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
                <MapPin className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
                {exam.seat.block} · {exam.seat.room}
              </p>

              <div className="mt-5 rounded-tile border border-line bg-canvas/40 p-4">
                <SeatMap seat={exam.seat} />
              </div>
            </>
          ) : (
            <SeatPanel exam={exam} at={at} />
          )}

          {exam.note ? (
            <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-snug text-ink-muted">
              <Info className="mt-px size-3.5 shrink-0 text-ink-subtle" aria-hidden />
              {exam.note}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- seat */

/**
 * The seat allocation, or an honest account of why there isn't one.
 *
 * An unreleased seat is a real state, not missing data — saying "published
 * about ten days before" answers the question the blank would have raised.
 */
function SeatPanel({ exam, at }: { exam: Exam; at: Date }) {
  if (!exam.seat) {
    const days = daysUntil(exam.date, at)
    const releaseIn = Math.max(0, days - DEMO_SEATING_RELEASE_DAYS)

    return (
      <div className="rounded-tile border border-dashed border-line bg-canvas/30 px-4 py-3.5">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-subtle">
          <Armchair className="size-3.5" aria-hidden />
          Seat
        </p>
        <p className="mt-1.5 text-[14px] font-medium text-ink">Not released yet</p>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
          {releaseIn > 0
            ? `Expected in about ${releaseIn} ${releaseIn === 1 ? 'day' : 'days'} — seating is published around ${DEMO_SEATING_RELEASE_DAYS} days before each paper in this demo.`
            : 'Seating for this paper should be published shortly.'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-tile border border-brand-border/50 bg-brand-soft/40 px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-brand-ink">
        <Armchair className="size-3.5" aria-hidden />
        Your seat
      </p>
      <p className="mt-1.5 text-[18px] font-semibold leading-none tabular-nums text-ink">
        {exam.seat.seat}
      </p>
      <p className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-snug text-ink-muted">
        <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
        <span>
          {exam.seat.block} · {exam.seat.room}
          {exam.seat.note ? <span className="block">{exam.seat.note}</span> : null}
        </span>
      </p>
    </div>
  )
}

/* -------------------------------------------------------------- exam card */

function ExamCard({ exam, at }: { exam: Exam; at: Date }) {
  const course = courseById.get(exam.courseId)
  const tone = examTone(exam, at)
  const finished = daysUntil(exam.date, at) < 0

  return (
    <article className="lift group card-premium p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-ink transition-colors duration-200 group-hover:text-brand-ink">
            {course?.name ?? 'Examination'}
          </h3>
          <p className="mt-0.5 text-[12.5px] text-ink-subtle">
            {examKindLabel[exam.kind]} · {course?.code} ·{' '}
            {formatDuration(examDurationMinutes(exam))}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[14px] font-medium tabular-nums text-ink">
            {formatDateLabel(exam.date)}
          </p>
          <p className="mt-0.5 text-[12.5px] tabular-nums text-ink-muted">
            {formatTime(exam.startTime)}–{formatTime(exam.endTime)}
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
        {!finished ? (
          <span
            className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', toneChip[tone])}
          >
            {whenLabel(exam, at)}
          </span>
        ) : null}

        {exam.seat ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted">
            <Armchair className="size-3.5 text-brand-ink" aria-hidden />
            <span className="font-medium text-ink">{exam.seat.seat}</span>
            <span>
              · {exam.seat.block} · {exam.seat.room}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-subtle">
            <Info className="size-3.5" aria-hidden />
            Seat not released yet
          </span>
        )}
      </div>

      {exam.note ? (
        <p className="mt-3 flex items-start gap-2 rounded-tile border border-warn/25 bg-warn-soft/20 px-3 py-2 text-[12.5px] leading-snug text-ink-muted">
          <CalendarClock className="mt-px size-3.5 shrink-0 text-warn-ink" aria-hidden />
          {exam.note}
        </p>
      ) : null}
    </article>
  )
}
