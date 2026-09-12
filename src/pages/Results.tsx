import { useState } from 'react'
import { ArrowUp, Sparkles, TrendingUp, ChevronDown, ChevronUp, BookOpen, Award, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageContainer } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/Badge'
import { DemoNote } from '@/components/ui/DemoTag'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { gradeColor, gradeLabel } from '@/data/results'
import { cn } from '@/lib/utils'
import { useResults } from '@/services/queries'

export default function Results() {
  const resultsQuery = useResults()
  const summary = resultsQuery.data
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  return (
    <PageContainer className="space-y-6">
      <div className="border-b border-[rgba(99,102,241,0.1)] pb-4">
        <h1 className="text-[28px] font-bold text-white tracking-tight">Academics & Results</h1>
        <p className="text-[14px] text-[#a0aec0]">
          Semester 2 Evaluation • Bachelor of Computer Applications (BCA)
        </p>
      </div>

      {resultsQuery.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-[180px] w-full rounded-[12px]" />
          <SkeletonRows count={5} />
        </div>
      ) : resultsQuery.isError || !summary ? (
        <ErrorState
          title="Results are unavailable"
          description="We could not load your results record just now."
          onRetry={() => resultsQuery.refetch()}
        />
      ) : (
        <>
          {/* ======================================================= WEIGHTED AVERAGE HERO */}
          <div className="rounded-[12px] border border-[rgba(99,102,241,0.2)] bg-gradient-to-br from-[#1a1f2e] to-[#252d3d] p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.20)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  Cumulative Standing
                </span>
                <div className="mt-1 flex items-baseline gap-4">
                  <span className="text-[48px] font-extrabold text-[#6366f1] leading-none tracking-tight">
                    78.4%
                  </span>
                  <div className="flex items-center gap-1 rounded-full bg-[#10b981]/15 px-2.5 py-0.5 text-[12px] font-bold text-[#10b981]">
                    <TrendingUp className="size-3.5" />
                    <span>+2.4% vs Sem 1</span>
                  </div>
                </div>
                <p className="mt-2 text-[14px] text-[#a0aec0]">
                  Current SGPA: <span className="text-white font-bold">{summary.currentSemester.sgpa.toFixed(2)}</span> • Overall CGPA: <span className="text-white font-bold">{summary.cgpa.toFixed(2)}</span>
                </p>
              </div>

              <div className="rounded-[8px] bg-white/[0.03] border border-white/5 p-4 text-center min-w-[160px]">
                <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                  Credits Completed
                </span>
                <div className="mt-1 text-[24px] font-bold text-white">
                  {summary.currentSemester.earnedCredits} / {summary.currentSemester.totalCredits}
                </div>
                <span className="text-[11px] text-[#10b981] font-semibold">On Track for Graduation</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all duration-1000"
                  style={{ width: '78.4%' }}
                />
              </div>
            </div>
          </div>

          {/* ======================================================= AI ACADEMIC ADVICE */}
          <div className="rounded-[12px] border border-[rgba(99,102,241,0.2)] bg-[#1a1f2e] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-start gap-4">
            <div className="grid size-10 place-items-center rounded-full bg-[#6366f1]/20 text-[#6366f1] shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-bold text-white">Performance Insight</h3>
              <p className="mt-1 text-[13px] text-[#a0aec0] leading-relaxed">
                Strongest discipline: <span className="text-white font-semibold">Web Development (O Grade, 90%)</span>.
                DBMS is currently evaluated at 62% with 50% coursework assessed. Scoring 75+ on the end-term lifts your grade to an A.
              </p>
              <div className="mt-3">
                <Link
                  to={`/app/assistant?q=${encodeURIComponent('How can I score an A in DBMS end-term?')}`}
                  className="text-[13px] font-semibold text-[#6366f1] hover:underline"
                >
                  Consult AI Study Strategy →
                </Link>
              </div>
            </div>
          </div>

          {/* ======================================================= BY COURSE BREAKDOWN */}
          <section className="space-y-4">
            <h2 className="text-[20px] font-bold text-white tracking-tight">Course Breakdown</h2>

            <div className="space-y-3">
              {summary.currentSemester.subjects.map((subject) => {
                const isExpanded = expandedCourse === subject.courseCode
                const isAboveAverage = subject.total >= subject.sectionAverage

                return (
                  <div
                    key={subject.courseCode}
                    className="rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] transition-all hover:border-[rgba(99,102,241,0.3)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedCourse(isExpanded ? null : subject.courseCode)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="grid size-10 place-items-center rounded-[8px] bg-white/[0.04] text-[#6366f1]">
                          <BookOpen className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-bold text-white">{subject.courseName}</h3>
                            <span className="text-[12px] text-[#64748b]">({subject.courseCode})</span>
                          </div>
                          <p className="text-[12px] text-[#a0aec0] mt-0.5">
                            {subject.credits} Credits • Grade Point: {subject.gradePoint} / 10
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:justify-end">
                        <div className="text-right">
                          <span className="text-[18px] font-bold text-white">{subject.total}%</span>
                          <div className="text-[11px] font-semibold text-[#10b981]">
                            Grade: {subject.grade} ({gradeLabel[subject.grade as any] ?? 'Good'})
                          </div>
                        </div>
                        <div className="text-[#64748b]">
                          {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-white/5 bg-black/20 p-5 space-y-4">
                        <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">
                          Component Breakdown
                        </h4>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-[8px] bg-[#1a1f2e] p-3 border border-white/5">
                            <span className="text-[11px] text-[#a0aec0]">Internal Marks</span>
                            <div className="mt-1 text-[16px] font-bold text-white">{subject.internal} / 40</div>
                          </div>
                          <div className="rounded-[8px] bg-[#1a1f2e] p-3 border border-white/5">
                            <span className="text-[11px] text-[#a0aec0]">Mid-Semester</span>
                            <div className="mt-1 text-[16px] font-bold text-white">{subject.midSem} / 30</div>
                          </div>
                          <div className="rounded-[8px] bg-[#1a1f2e] p-3 border border-white/5">
                            <span className="text-[11px] text-[#a0aec0]">End-Semester</span>
                            <div className="mt-1 text-[16px] font-bold text-white">{subject.endSem} / 30</div>
                          </div>
                          <div className="rounded-[8px] bg-[#1a1f2e] p-3 border border-white/5">
                            <span className="text-[11px] text-[#a0aec0]">Section Average</span>
                            <div className="mt-1 text-[16px] font-bold text-white">{subject.sectionAverage} / 100</div>
                          </div>
                        </div>

                        <div className="rounded-[8px] bg-[#6366f1]/10 border border-[#6366f1]/20 p-3 text-[12px] text-[#a0aec0]">
                          <span className="font-bold text-white">Comparative Evaluation: </span>
                          {isAboveAverage
                            ? `You scored ${subject.total - subject.sectionAverage}% higher than your cohort average.`
                            : `You are ${subject.sectionAverage - subject.total}% below the section cohort average.`}
                        </div>
                      </div>
                    )}
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
