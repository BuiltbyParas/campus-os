import { useState } from 'react'
import { CheckCircle2, Clock, MapPin, AlertCircle, FileCheck, ShieldAlert, Award } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { DemoNote } from '@/components/ui/DemoTag'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { examTypeLabel } from '@/data/examinations'
import { cn, formatTime } from '@/lib/utils'
import { daysUntilExam } from '@/services/examinations'
import { useExamSchedule } from '@/services/queries'

export default function Examinations() {
  const scheduleQuery = useExamSchedule()
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')

  const schedule = scheduleQuery.data
  const exams = schedule
    ? [...schedule.exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : []

  const nextExam = exams.find((e) => daysUntilExam(e.date) >= 0)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

  const filteredExams = exams.filter((e) => {
    const isPast = daysUntilExam(e.date) < 0
    if (filter === 'upcoming') return !isPast
    if (filter === 'completed') return isPast
    return true
  })

  return (
    <PageContainer className="space-y-6">
      <div className="border-b border-[rgba(99,102,241,0.1)] pb-4">
        <h1 className="text-[28px] font-bold text-white tracking-tight">Examinations</h1>
        <p className="text-[14px] text-[#a0aec0]">
          End Semester Examinations Schedule • Autumn 2026
        </p>
      </div>

      {scheduleQuery.isPending ? (
        <div className="space-y-6">
          <Skeleton className="h-[240px] w-full rounded-[12px]" />
          <SkeletonRows count={4} />
        </div>
      ) : scheduleQuery.isError ? (
        <ErrorState
          title="Examinations unavailable"
          description="We could not load your examination schedule."
          onRetry={() => scheduleQuery.refetch()}
        />
      ) : (
        <>
          {/* ======================================================= NEXT EXAM HERO */}
          {nextExam && (
            <div className="relative overflow-hidden rounded-[12px] border border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-[#1a1f2e] via-[#252d3d] to-[#1a1f2e] p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.20)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#f59e0b]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#f59e0b] border border-[#f59e0b]/20">
                    Next Examination
                  </div>
                  <h2 className="text-[28px] font-bold text-white tracking-tight">
                    {nextExam.courseName}
                  </h2>
                  <p className="text-[14px] text-[#a0aec0]">
                    Course Code: <span className="text-white font-medium">{nextExam.courseCode}</span> • Type: {examTypeLabel[nextExam.type]}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-3 text-white">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-[#6366f1]" />
                      <span className="text-[14px]">
                        {formatDate(nextExam.date)} • {formatTime(nextExam.startTime)} ({nextExam.duration} mins)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-[#6366f1]" />
                      <span className="text-[14px]">{nextExam.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Countdown Box */}
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.03] p-6 min-w-[180px] backdrop-blur-md">
                  <span className="text-[36px] font-extrabold text-[#6366f1] leading-none tracking-tight">
                    6d 05h
                  </span>
                  <span className="mt-2 text-[12px] font-semibold uppercase tracking-wider text-[#64748b]">
                    Time Remaining
                  </span>
                </div>
              </div>

              {/* Progress & Assessment Bars */}
              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/5 pt-6 sm:grid-cols-3">
                <div>
                  <div className="flex justify-between text-[12px] text-[#a0aec0] mb-1">
                    <span>Course Attendance</span>
                    <span className="text-[#ef4444] font-bold">72%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-[#ef4444]" style={{ width: '72%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] text-[#a0aec0] mb-1">
                    <span>Assessed Marks</span>
                    <span className="text-[#10b981] font-bold">62%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-[#10b981]" style={{ width: '62%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] text-[#a0aec0] mb-1">
                    <span>Syllabus Covered</span>
                    <span className="text-[#6366f1] font-bold">50% assessed</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-[#6366f1]" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= SEAT VISUALIZATION & RESTRICTIONS */}
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Room Layout Grid */}
            <div className="rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              <h3 className="text-[16px] font-bold text-white mb-2">Examination Hall Seating</h3>
              <p className="text-[13px] text-[#a0aec0] mb-6">
                Hall: {nextExam?.venue ?? 'Block 34, Room 204'} • Assigned Desk:{' '}
                <span className="font-bold text-[#6366f1]">{nextExam?.seatNumber ?? 'B-12'}</span>
              </p>

              {/* Graphical Seating Grid */}
              <div className="space-y-4">
                <div className="w-full text-center py-1 bg-white/5 rounded text-[11px] font-semibold text-[#64748b] tracking-wider uppercase">
                  Invigilator Desk / Front Podium
                </div>

                <div className="grid grid-cols-6 gap-2 sm:gap-3 py-4 place-items-center">
                  {Array.from({ length: 18 }).map((_, i) => {
                    const isUserSeat = i === 7 // Seat B-12 simulation
                    return (
                      <div
                        key={i}
                        className={cn(
                          'size-9 sm:size-11 rounded-[6px] flex items-center justify-center text-[12px] font-semibold transition-all',
                          isUserSeat
                            ? 'bg-[#6366f1] text-white shadow-[0_0_12px_rgba(99,102,241,0.6)] ring-2 ring-white scale-110'
                            : 'border border-white/10 bg-white/[0.03] text-[#64748b]'
                        )}
                      >
                        {isUserSeat ? 'B-12' : `S${i + 1}`}
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 text-[12px] pt-2 text-[#a0aec0]">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-[#6366f1]" />
                    <span>Your Allocated Seat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded border border-white/10 bg-white/5" />
                    <span>Other Candidates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Restrictions Box */}
            <div className="rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.12)] space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-[#f59e0b]" />
                <h3 className="text-[16px] font-bold text-white">Regulations & Instructions</h3>
              </div>

              <div className="space-y-3 text-[13px] text-[#a0aec0]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span>Physical University Identity Card mandatory</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span>Only non-programmable scientific calculators permitted</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span>Strictly closed book examination format</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="size-4 text-[#ef4444] shrink-0 mt-0.5" />
                  <span>Zero tolerance for mobile phones or electronic wearables</span>
                </div>
              </div>

              <div className="mt-4 rounded-[8px] border border-white/5 bg-white/[0.03] p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  Reporting Window
                </span>
                <p className="mt-1 text-[13px] text-white">
                  Candidates must enter by 9:30 AM. No admissions past 9:45 AM.
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================= ALL PAPERS LIST */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-[20px] font-bold text-white tracking-tight">Full Paper Timetable</h2>
              <div className="flex items-center gap-1.5 rounded-[8px] bg-white/5 p-1 border border-white/5">
                {(['all', 'upcoming', 'completed'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilter(mode)}
                    className={cn(
                      'rounded-[6px] px-3 py-1 text-[12px] font-semibold capitalize transition-all',
                      filter === mode
                        ? 'bg-[#6366f1] text-white'
                        : 'text-[#a0aec0] hover:text-white'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-white/5 rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] overflow-hidden">
              {filteredExams.map((exam) => {
                const days = daysUntilExam(exam.date)
                const isPast = days < 0

                return (
                  <div
                    key={exam.id}
                    className={cn(
                      'flex flex-col md:flex-row md:items-center justify-between p-5 gap-4 transition-colors hover:bg-white/[0.02]',
                      isPast && 'opacity-60'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 place-items-center rounded-[8px] border border-white/10 bg-white/[0.03] text-center">
                        <span className="text-[10px] font-bold uppercase text-[#64748b]">
                          {new Date(exam.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-[18px] font-bold text-white leading-none">
                          {new Date(exam.date).getDate()}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-[15px] font-bold text-white">{exam.courseName}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[#64748b]">
                          <span>{exam.courseCode}</span>
                          <span>•</span>
                          <span>{formatTime(exam.startTime)}</span>
                          <span>•</span>
                          <span>{exam.venue} (Seat {exam.seatNumber})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center md:justify-end">
                      {isPast ? (
                        <span className="rounded-full bg-white/5 px-3 py-1 text-[12px] font-medium text-[#64748b]">
                          Completed
                        </span>
                      ) : (
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-[12px] font-bold',
                            days <= 3
                              ? 'bg-[#ef4444]/15 text-[#ef4444]'
                              : days <= 7
                              ? 'bg-[#f59e0b]/15 text-[#f59e0b]'
                              : 'bg-[#6366f1]/15 text-[#6366f1]'
                          )}
                        >
                          {days === 0 ? 'Today' : `In ${days} days`}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <DemoNote>
            Official examination admit slips and attendance eligibility are subject to university clearance.
          </DemoNote>
        </>
      )}
    </PageContainer>
  )
}

