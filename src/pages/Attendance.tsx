import { CalendarCheck2, GraduationCap, Sparkles, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AttendanceProjection } from '@/components/app/AttendanceProjection'
import { AttendanceRow } from '@/components/app/AttendanceRow'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { DemoNote, DemoTag } from '@/components/ui/DemoTag'
import { CountUp } from '@/components/ui/CountUp'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Sparkline } from '@/components/ui/Sparkline'
import { StatTile } from '@/components/ui/StatTile'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { courseById } from '@/data'
import { attendanceStatusTone } from '@/lib/attendance'
import { formatRelative } from '@/lib/utils'
import { useAttendance } from '@/services/queries'

export default function Attendance() {
  const attendance = useAttendance()
  const summary = attendance.data

  const below = summary?.courses.filter((course) => course.status === 'below') ?? []
  const sorted = summary ? [...summary.courses].sort((a, b) => a.percentage - b.percentage) : []
  const onTrack = summary?.courses.filter((course) => course.status === 'safe').length ?? 0
  const weakest = sorted[0]

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Your percentage in each course, and how much room is left before the requirement."
      />

      {attendance.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-[196px] w-full rounded-card" />
          <div className="rounded-card border border-line bg-surface p-5">
            <SkeletonRows count={5} />
          </div>
        </div>
      ) : attendance.isError || !summary ? (
        <ErrorState
          title="Attendance is unavailable"
          description="We could not load your attendance record just now."
          onRetry={() => attendance.refetch()}
        />
      ) : (
        <>
          {/* ------------------------------------------------------- overview */}
          <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
              <ProgressRing
                value={summary.overallPercentage}
                threshold={summary.requiredPercentage}
                tone={attendanceStatusTone[summary.status]}
                size={148}
                label="Overall attendance"
                caption={`${summary.requiredPercentage}% required`}
                trend={
                  summary.trend && summary.trend.length > 1
                    ? summary.trend[summary.trend.length - 1] - summary.trend[0]
                    : undefined
                }
              />

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h2 className="text-[17px] font-semibold tracking-tight text-ink">
                    Overall this semester
                  </h2>
                  {summary.source === 'demo' ? <DemoTag /> : null}
                </div>

                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
                  You have attended{' '}
                  <span className="font-medium text-ink">
                    {summary.totalAttended} of {summary.totalHeld}
                  </span>{' '}
                  classes across {summary.courses.length} courses.
                  {below.length > 0 ? (
                    <>
                      {' '}
                      <span className="font-medium text-danger-ink">
                        {below.length === 1 ? 'One course is' : `${below.length} courses are`} below
                        the {summary.requiredPercentage}% requirement.
                      </span>
                    </>
                  ) : (
                    ' Every course is above the requirement.'
                  )}
                </p>

                {/* The shape of the semester so far, drawn from the same
                    weekly ledger the percentage above is summed from. */}
                {summary.trend && summary.trend.length > 1 ? (
                  <div className="mt-4 flex items-center gap-3">
                    <Sparkline
                      values={summary.trend}
                      threshold={summary.requiredPercentage}
                      tone={attendanceStatusTone[summary.status]}
                      width={132}
                      height={34}
                      label={`Overall attendance across ${summary.trend.length} weeks, ending at ${Math.round(summary.overallPercentage)}% against a ${summary.requiredPercentage}% requirement`}
                    />
                    <p className="text-[12px] leading-snug text-ink-subtle">
                      {summary.trend.length} weeks
                      <br />
                      {summary.trend[summary.trend.length - 1] >= summary.trend[0]
                        ? 'holding steady'
                        : 'trending down'}
                    </p>
                  </div>
                ) : null}

                <p className="mt-3 text-[12.5px] text-ink-subtle">
                  Updated {formatRelative(summary.updatedAt)}
                </p>
              </div>
            </div>

            {/* The three figures a student checks before deciding anything. */}
            <div className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
              <StatTile
                icon={CalendarCheck2}
                label="Classes attended"
                value={
                  <>
                    <CountUp value={summary.totalAttended} />
                    <span className="text-[17px] text-ink-muted"> / {summary.totalHeld}</span>
                  </>
                }
                detail={`Across ${summary.courses.length} courses`}
              />
              <StatTile
                icon={GraduationCap}
                label="Courses on track"
                value={
                  <>
                    <CountUp value={onTrack} />
                    <span className="text-[17px] text-ink-muted"> / {summary.courses.length}</span>
                  </>
                }
                tone={onTrack === summary.courses.length ? 'ok' : 'warn'}
                detail={below.length > 0 ? `${below.length} below the line` : 'None below the line'}
              />
              <StatTile
                icon={TrendingDown}
                label="Lowest course"
                value={weakest ? `${Math.round(weakest.percentage)}%` : '—'}
                tone={weakest ? attendanceStatusTone[weakest.status] : 'info'}
                detail={weakest ? (courseById.get(weakest.courseId)?.name ?? undefined) : undefined}
                to="#by-course"
              />
            </div>
          </section>

          {/* ------------------------------------------------------ shortfall */}
          {below.length > 0 ? (
            <section className="relative overflow-hidden rounded-card border border-danger/25 bg-danger-soft/25 p-5 pl-6 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-danger before:content-['']">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <TrendingDown
                    className="mt-0.5 size-[18px] shrink-0 text-danger-ink"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-ink">
                      {below.length === 1 ? 'One course needs' : `${below.length} courses need`}{' '}
                      attention
                    </h2>
                    <ul className="mt-2 space-y-1.5">
                      {below.map((course) => (
                        <li key={course.courseId} className="text-[13.5px] text-ink-muted">
                          <span className="font-medium text-ink">
                            {courseById.get(course.courseId)?.name}
                          </span>{' '}
                          — {Math.round(course.percentage)}%, attend the next {course.mustAttend}{' '}
                          classes to reach {course.requiredPercentage}%.
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  to={`/app/assistant?q=${encodeURIComponent('How is my attendance looking?')}`}
                  className="press inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control border border-line bg-surface px-3.5 py-2.5 text-[13px] font-medium text-ink hover:border-line-strong"
                >
                  <Sparkles className="size-3.5 text-brand-ink" aria-hidden />
                  Ask the assistant what to do
                </Link>
              </div>
            </section>
          ) : null}

          {/* ----------------------------------------------------- projection */}
          <AttendanceProjection summary={summary} />

          {/* -------------------------------------------------------- courses */}
          <section id="by-course" className="scroll-mt-24">
            <h2 className="mb-3 text-[17px] font-semibold tracking-tight text-ink">By course</h2>
            <div className="divide-y divide-line rounded-card border border-line bg-surface px-5">
              {sorted.map((course) => (
                <AttendanceRow key={course.courseId} attendance={course} />
              ))}
            </div>
          </section>

          <DemoNote>
            Attendance figures and the {summary.requiredPercentage}% requirement are demo data for
            this prototype. They are not official university records or rules.
          </DemoNote>
        </>
      )}
    </PageContainer>
  )
}
