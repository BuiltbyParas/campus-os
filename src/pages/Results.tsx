import { ArrowUp, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/Badge'
import { DemoNote, DemoTag } from '@/components/ui/DemoTag'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { gradeColor, gradeLabel } from '@/data/results'
import { cn } from '@/lib/utils'
import { useResults } from '@/services/queries'

export default function Results() {
  const resultsQuery = useResults()
  const summary = resultsQuery.data

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Results"
        description="Semester 2 · BCA"
      />

      {resultsQuery.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-[148px] w-full rounded-card" />
          <div className="rounded-card border border-line bg-surface p-5">
            <SkeletonRows count={5} />
          </div>
        </div>
      ) : resultsQuery.isError || !summary ? (
        <ErrorState
          title="Results are unavailable"
          description="We could not load your results record just now."
          onRetry={() => resultsQuery.refetch()}
        />
      ) : (
        <>
          {/* Hero Card */}
          <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[40px] font-semibold tracking-tight text-ink tabular-nums leading-none">
                    {summary.currentSemester.sgpa.toFixed(2)}
                  </h2>
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-medium text-ink-muted leading-none">SGPA</span>
                    {summary.currentSemester.sgpa > (summary.sgpaHistory.find(h => h.semester === summary.currentSemester.semester - 1)?.sgpa || 0) && (
                      <span className="flex items-center text-[12px] font-medium text-ok-ink">
                        <ArrowUp className="size-3 mr-0.5" />
                        Up from Sem {summary.currentSemester.semester - 1}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <p className="text-[15px] font-medium text-ink-muted tabular-nums">
                    CGPA {summary.cgpa.toFixed(2)}
                  </p>
                  <Badge tone="ok">
                    {summary.currentSemester.earnedCredits} / {summary.currentSemester.totalCredits} Credits
                  </Badge>
                </div>
              </div>
              {summary.source === 'demo' ? <DemoTag /> : null}
            </div>
          </section>

          {/* SGPA Trend */}
          <section>
            <p className="text-[14px] text-ink-muted font-medium">
              Trend: {summary.sgpaHistory.map(h => `Sem ${h.semester} (${h.sgpa.toFixed(2)})`).join(' → ')}
            </p>
          </section>

          {/* AI Insight Card */}
          <GlassPanel weight="panel" className="rounded-card border border-brand-border bg-brand-soft/30 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-[18px] shrink-0 text-brand-ink" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] leading-relaxed text-ink">
                  Your strongest subject is <span className="font-semibold">Web Development (O grade)</span>. DBMS and Mathematics scored below section average — consider revision workshops.
                </p>
                <div className="mt-3">
                  <Link
                    to={`/app/assistant?q=${encodeURIComponent('How can I improve my grades in DBMS and Mathematics?')}`}
                    className="press inline-flex items-center text-[13.5px] font-medium text-brand-ink hover:underline"
                  >
                    Ask about your results →
                  </Link>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Subject Breakdown */}
          <section>
            <h2 className="mb-3 text-[17px] font-semibold tracking-tight text-ink">Subject Breakdown</h2>
            <div className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
              {summary.currentSemester.subjects.map((subject) => {
                const isAboveAverage = subject.total > subject.sectionAverage
                const isWellBelowAverage = subject.total < subject.sectionAverage - 10

                return (
                  <div key={subject.courseId} className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-semibold text-ink truncate">
                            {subject.courseName}
                          </h3>
                          <span className="text-[12px] font-medium text-ink-muted">
                            {subject.courseCode}
                          </span>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-4 gap-4 text-center sm:text-left">
                          <div>
                            <div className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">Internal</div>
                            <div className="mt-1 text-[14px] font-medium text-ink tabular-nums">{subject.internal}/40</div>
                          </div>
                          <div>
                            <div className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">Mid</div>
                            <div className="mt-1 text-[14px] font-medium text-ink tabular-nums">{subject.midSem}/30</div>
                          </div>
                          <div>
                            <div className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">End</div>
                            <div className="mt-1 text-[14px] font-medium text-ink tabular-nums">{subject.endSem}/30</div>
                          </div>
                          <div>
                            <div className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">Total</div>
                            <div className="mt-1 text-[14px] font-semibold text-ink tabular-nums">{subject.total}/100</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <div className={cn(
                            "h-1.5 w-32 rounded-full bg-surface-muted overflow-hidden relative",
                          )}>
                            <div 
                              className={cn(
                                "absolute top-0 left-0 bottom-0 rounded-full",
                                isAboveAverage ? "bg-ok" : isWellBelowAverage ? "bg-warn" : "bg-info"
                              )}
                              style={{ width: `${subject.total}%` }}
                            />
                            <div 
                              className="absolute top-0 bottom-0 w-0.5 bg-ink"
                              style={{ left: `${subject.sectionAverage}%` }}
                              title={`Section Average: ${subject.sectionAverage}`}
                            />
                          </div>
                          <span className="text-[12px] text-ink-subtle">
                            Your score vs section average ({subject.sectionAverage})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                        <Badge tone={gradeColor[subject.grade] as any} size="md" className="text-[14px]">
                          Grade {subject.grade}
                        </Badge>
                        <span className="text-[13px] font-medium text-ink-muted">
                          {subject.gradePoint} Grade Points
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <DemoNote>
            Grades and SGPA/CGPA calculations are demo data for this prototype. They are not official university records.
          </DemoNote>
        </>
      )}
    </PageContainer>
  )
}
