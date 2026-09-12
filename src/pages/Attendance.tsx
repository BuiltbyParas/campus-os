import { Sparkles, TrendingDown, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AttendanceProjection } from '@/components/app/AttendanceProjection'
import { AttendanceRow } from '@/components/app/AttendanceRow'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { DemoNote } from '@/components/ui/DemoTag'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { courseById } from '@/data'
import { formatRelative } from '@/lib/utils'
import { useAttendance } from '@/services/queries'

export default function Attendance() {
  const attendance = useAttendance()
  const summary = attendance.data

  const below = summary?.courses.filter((course) => course.status === 'below') ?? []
  const sorted = summary ? [...summary.courses].sort((a, b) => a.percentage - b.percentage) : []

  return (
    <PageContainer className="space-y-6">
      <div className="border-b border-[rgba(99,102,241,0.1)] pb-4">
        <h1 className="text-[28px] font-bold text-white tracking-tight">Attendance</h1>
        <p className="text-[14px] text-[#a0aec0]">
          Comprehensive tracking across all enrolled courses and threshold analytics.
        </p>
      </div>

      {attendance.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-[12px]" />
          <div className="rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-5">
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
          {/* ======================================================= HERO SECTION */}
          <div className="rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-gradient-to-br from-[#1a1f2e] to-[#252d3d] p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.20)]">
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-center">
              {/* Circular Progress Gauge */}
              <div className="relative grid size-[180px] shrink-0 place-items-center">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="stroke-white/10"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  />
                  <circle
                    className="stroke-[#6366f1] transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - summary.overallPercentage / 100)}
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-[36px] font-bold text-white tracking-tight">
                    {Math.round(summary.overallPercentage)}%
                  </span>
                  <span className="text-[12px] font-medium text-[#64748b]">
                    {summary.requiredPercentage}% required
                  </span>
                </div>
              </div>

              {/* Summary Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#10b981]/15 px-3 py-1 text-[12px] font-bold text-[#10b981] border border-[#10b981]/20">
                  <CheckCircle2 className="size-3.5" />
                  Eligible for Semester Examinations
                </div>
                <h2 className="mt-3 text-[22px] font-bold text-white">Overall Semester Standing</h2>
                <p className="mt-1 text-[14px] text-[#a0aec0] max-w-xl">
                  You have attended{' '}
                  <span className="font-semibold text-white">
                    {summary.totalAttended} of {summary.totalHeld}
                  </span>{' '}
                  classes across {summary.courses.length} courses.
                  {below.length > 0
                    ? ` ${below.length} course requires your attention to meet minimum norms.`
                    : ' All courses are comfortably above standard thresholds.'}
                </p>
                <p className="mt-4 text-[12px] text-[#64748b]">
                  Sync timestamp: {formatRelative(summary.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================= STAT CARDS ROW */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#64748b]">
                Total Classes
              </span>
              <div className="mt-2 text-[28px] font-bold text-white">
                {summary.totalAttended} <span className="text-[16px] font-normal text-[#64748b]">/ {summary.totalHeld}</span>
              </div>
              <p className="mt-1 text-[12px] text-[#a0aec0]">Recorded attendance sessions</p>
            </div>

            <div className="rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#64748b]">
                Buffer Allowance
              </span>
              <div className="mt-2 text-[28px] font-bold text-[#10b981]">
                +5 <span className="text-[16px] font-normal text-[#64748b]">classes</span>
              </div>
              <p className="mt-1 text-[12px] text-[#a0aec0]">Safely skippable before penalty</p>
            </div>

            <div className="rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#64748b]">
                Lowest Course
              </span>
              <div className="mt-2 text-[28px] font-bold text-[#ef4444]">
                72% <span className="text-[14px] font-normal text-[#64748b]">(DBMS)</span>
              </div>
              <p className="mt-1 text-[12px] text-[#ef4444]/90">Need 3 consecutive attendances</p>
            </div>
          </div>

          {/* ======================================================= SHORTFALL ALERT */}
          {below.length > 0 && (
            <div className="flex flex-col gap-4 rounded-[12px] border-l-4 border-[#ef4444] border-y border-r border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-5 lg:flex-row lg:items-center lg:justify-between shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <div className="flex items-start gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-[#ef4444]/20 text-[#ef4444] shrink-0">
                  <AlertTriangle className="size-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white">Course Shortfall Detected</h3>
                  <div className="mt-1 space-y-1">
                    {below.map((course) => (
                      <p key={course.courseId} className="text-[13px] text-[#a0aec0]">
                        <span className="font-semibold text-white">
                          {courseById.get(course.courseId)?.name}
                        </span>{' '}
                        stands at {Math.round(course.percentage)}%. Attend next {course.mustAttend}{' '}
                        classes to recover.
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                to={`/app/assistant?q=${encodeURIComponent('How do I recover my DBMS attendance?')}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[#6366f1] px-4 py-2 text-[13px] font-semibold text-white hover:brightness-110 shadow-[0_2px_8px_rgba(99,102,241,0.3)] transition-all"
              >
                <Sparkles className="size-3.5" />
                AI Recovery Advice
              </Link>
            </div>
          )}

          {/* ======================================================= PROJECTION */}
          <AttendanceProjection summary={summary} />

          {/* ======================================================= BY COURSE */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-white tracking-tight">Enrolled Courses</h2>
            <div className="divide-y divide-white/5 rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] px-5">
              {sorted.map((course) => (
                <AttendanceRow key={course.courseId} attendance={course} />
              ))}
            </div>
          </section>

          <DemoNote>
            Attendance calculations and required minimums reflect official semester criteria.
          </DemoNote>
        </>
      )}
    </PageContainer>
  )
}

