import { useState } from 'react'
import { Clock, Info } from 'lucide-react'

import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/Badge'
import { DemoNote } from '@/components/ui/DemoTag'
import { reEvalStatus } from '@/data/reevaluation'
import { cn } from '@/lib/utils'

export default function Reevaluation() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  
  const toggleSelect = (courseId: string) => {
    const next = new Set(selected)
    if (next.has(courseId)) {
      next.delete(courseId)
    } else {
      next.add(courseId)
    }
    setSelected(next)
  }

  const handleSubmit = () => {
    alert('Re-evaluation request submitted!')
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Re-Evaluation"
        description="Request a marks review"
      />

      <div className="flex items-start gap-3 rounded-card bg-info-soft p-4 text-info-ink">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="text-[13.5px] leading-relaxed">
          You can apply for re-evaluation if you believe your answer sheets were evaluated incorrectly. 
          The revised marks will be final, even if they are lower than the original.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-[17px] font-semibold tracking-tight text-ink">Eligible Subjects</h2>
        <div className="space-y-3">
          {reEvalStatus.eligible.map(subject => (
            <label 
              key={subject.courseId} 
              className={cn(
                "flex cursor-pointer gap-4 rounded-card border p-4 transition-colors",
                selected.has(subject.courseId) 
                  ? "border-brand border-2 bg-brand-soft/20" 
                  : "border-line bg-surface hover:border-line-strong"
              )}
            >
              <div className="pt-1">
                <input
                  type="checkbox"
                  className="size-4 rounded border-line-strong text-brand focus:ring-brand"
                  checked={selected.has(subject.courseId)}
                  onChange={() => toggleSelect(subject.courseId)}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink">{subject.courseName}</h3>
                    <p className="text-[13px] text-ink-muted">{subject.courseCode}</p>
                  </div>
                  <Badge tone="warn">{Math.round(subject.historicalSuccessRate * 100)}% success rate</Badge>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                   <div className="rounded-control bg-surface-muted p-2">
                     <p className="text-[11.5px] uppercase tracking-wider text-ink-subtle">Grade</p>
                     <p className="font-semibold text-ink">{subject.currentGrade}</p>
                   </div>
                   <div className="rounded-control bg-surface-muted p-2">
                     <p className="text-[11.5px] uppercase tracking-wider text-ink-subtle">Score</p>
                     <p className="font-semibold text-ink">{subject.currentTotal}/{subject.maxMarks}</p>
                   </div>
                   <div className="rounded-control bg-surface-muted p-2 sm:col-span-2">
                     <p className="text-[11.5px] uppercase tracking-wider text-ink-subtle">Fee</p>
                     <p className="font-semibold text-ink">₹{subject.reEvalFee}</p>
                   </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {selected.size > 0 && (
        <section className="rounded-card border border-line bg-surface p-5">
           <h2 className="text-[15px] font-semibold text-ink">Request Summary</h2>
           <div className="mt-4 space-y-2 text-[14px]">
              <div className="flex justify-between text-ink-muted">
                <span>Selected Subjects</span>
                <span className="font-medium text-ink">{selected.size}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-ink-muted">
                <span>Total Fee</span>
                <span className="font-medium text-ink">₹{selected.size * reEvalStatus.feePerSubject}</span>
              </div>
           </div>
           
           <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] text-ink-muted">
                 <Clock className="size-4" aria-hidden />
                 <span>Deadline: {reEvalStatus.deadline}</span>
              </div>
              <button 
                onClick={handleSubmit}
                className="press rounded-control bg-brand px-4 py-2 text-[14px] font-medium text-on-brand hover:bg-brand-hover"
              >
                Submit Re-Evaluation Request
              </button>
           </div>
        </section>
      )}

      <DemoNote>
        This is a mockup. Payment gateways and actual requests are not functional.
      </DemoNote>
    </PageContainer>
  )
}
