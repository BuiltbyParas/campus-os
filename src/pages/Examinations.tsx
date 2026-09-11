import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { DemoNote, DemoTag } from '@/components/ui/DemoTag'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { examTypeLabel } from '@/data/examinations'
import { cn, formatTime } from '@/lib/utils'
import { daysUntilExam } from '@/services/examinations'
import { useExamSchedule } from '@/services/queries'
import { CheckCircle2, Clock, MapPin } from 'lucide-react'

export default function Examinations() {
  const scheduleQuery = useExamSchedule()

  const schedule = scheduleQuery.data
  const exams = schedule
    ? [...schedule.exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : []

  const nextExam = exams.find((e) => daysUntilExam(e.date) >= 0)

  // date formatting helper
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Examinations" description="End Semester · 2026-27" />

      {scheduleQuery.isPending ? (
        <div className="space-y-6">
          <div className="rounded-card border border-line bg-surface p-5">
            <Skeleton className="h-4 w-32" />
            <SkeletonRows className="mt-5" count={4} />
          </div>
        </div>
      ) : scheduleQuery.isError ? (
        <ErrorState
          title="Examinations unavailable"
          description="We could not load your examination schedule."
          onRetry={() => scheduleQuery.refetch()}
        />
      ) : (
        <>
          {/* Next Exam Hero Card */}
          {nextExam && (
            <section className="rounded-card border border-line bg-surface overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Countdown side */}
                <div
                  className={cn(
                    'flex flex-col items-center justify-center p-6 md:w-1/3 md:border-r border-b md:border-b-0 border-line',
                    (() => {
                      const days = daysUntilExam(nextExam.date)
                      if (days <= 3) return 'bg-danger/10 text-danger'
                      if (days <= 7) return 'bg-warn/10 text-warn'
                      return 'bg-info/10 text-info'
                    })()
                  )}
                >
                  <div className="text-[48px] font-bold tracking-tighter leading-none mb-2">
                    {daysUntilExam(nextExam.date)}
                  </div>
                  <div className="text-[15px] font-medium uppercase tracking-widest opacity-80">
                    Days To Go
                  </div>
                </div>

                {/* Details side */}
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-block rounded-full bg-surface-muted px-2.5 py-1 text-[12px] font-medium text-ink-subtle">
                        {examTypeLabel[nextExam.type]}
                      </span>
                      {schedule?.source === 'demo' && <DemoTag />}
                    </div>

                    <h3 className="text-[20px] font-semibold tracking-tight text-ink mb-1">
                      {nextExam.courseName}
                    </h3>
                    <p className="text-[14px] text-ink-muted mb-6">
                      {nextExam.courseCode}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-ink-subtle mt-0.5" />
                        <div>
                          <p className="text-[13px] font-medium text-ink">
                            {formatDate(nextExam.date)}
                          </p>
                          <p className="text-[12.5px] text-ink-subtle">
                            {formatTime(nextExam.startTime)} • {nextExam.duration} mins
                          </p>
                          <p className="text-[12.5px] text-warn mt-1 font-medium">
                            Report by {formatTime(nextExam.reportingTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-ink-subtle mt-0.5" />
                        <div>
                          <p className="text-[13px] font-medium text-ink">
                            {nextExam.venue}
                          </p>
                          <p className="text-[12.5px] text-ink-subtle">
                            Seat: <span className="font-medium text-ink">{nextExam.seatNumber}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-line">
                    <p className="text-[12.5px] font-medium text-ink mb-2">Syllabus</p>
                    <div className="flex flex-wrap gap-2">
                      {nextExam.syllabus.map((unit) => (
                        <span
                          key={unit}
                          className="rounded-control bg-surface-raised border border-line px-2 py-1 text-[12px] text-ink-muted"
                        >
                          {unit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Full Schedule Card */}
          <section className="rounded-card border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[17px] font-semibold tracking-tight text-ink">
                All Examinations
              </h2>
            </div>
            <div className="divide-y divide-line">
              {exams.map((exam) => {
                const days = daysUntilExam(exam.date)
                const isNext = nextExam?.id === exam.id
                const isPast = days < 0

                return (
                  <div
                    key={exam.id}
                    className={cn(
                      'px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors',
                      isNext ? 'bg-brand-soft' : 'bg-surface hover:bg-surface-muted',
                      isPast ? 'opacity-50 grayscale' : ''
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center min-w-[60px] rounded-control bg-surface-raised p-2 border border-line">
                        <span className="text-[11px] font-medium uppercase text-ink-subtle">
                          {new Date(exam.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-[20px] font-bold text-ink leading-none mt-1">
                          {new Date(exam.date).getDate()}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-[15px] font-medium text-ink">
                          {exam.courseName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[13px] text-ink-subtle">{exam.courseCode}</span>
                          <span className="w-1 h-1 rounded-full bg-line-strong" />
                          <span className="text-[13px] text-ink-subtle tabular-nums">{formatTime(exam.startTime)}</span>
                          <span className="w-1 h-1 rounded-full bg-line-strong" />
                          <span className="text-[13px] text-ink-subtle">{exam.venue} (Seat {exam.seatNumber})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center md:justify-end">
                      {isPast ? (
                        <span className="text-[12.5px] font-medium text-ink-muted">Completed</span>
                      ) : (
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-[12px] font-medium',
                            days <= 3
                              ? 'bg-danger/10 text-danger'
                              : days <= 7
                                ? 'bg-warn/10 text-warn'
                                : 'bg-info/10 text-info'
                          )}
                        >
                          {days === 0 ? 'Today' : `${days} days`}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Exam Day Reminder Card */}
          <section className="rounded-card border border-line bg-surface p-5">
            <h3 className="text-[15px] font-medium text-ink mb-4">Exam Day Checklist</h3>
            <ul className="space-y-3">
              {[
                'Carry university ID card',
                'Arrive 30 minutes before reporting time',
                'Bring required stationery',
                'No electronic devices in examination hall',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-ok shrink-0" />
                  <span className="text-[14px] text-ink-muted">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {schedule?.source === 'demo' && (
            <DemoNote>
              This is a demonstration of the examinations feature. The data shown is mocked and not real.
            </DemoNote>
          )}
        </>
      )}
    </PageContainer>
  )
}
