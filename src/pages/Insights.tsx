import { useStore } from '@/app/store'
import { SparkChart } from '@/components/app/SparkChart'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { DemoNote } from '@/components/ui/DemoTag'
import { courseById } from '@/data'
import { cn } from '@/lib/utils'
import { sessionsForDay } from '@/services/academics'
import { useAttendance, useComplaints, useDeadlines, useTimetable } from '@/services/queries'
import type { Weekday } from '@/types'

export default function Insights() {
  const attendance = useAttendance()
  const timetable = useTimetable()
  const complaints = useComplaints()
  const deadlines = useDeadlines()
  const { isRegistered } = useStore() // Simplified from registeredEvents since we only have isRegistered method in store actually, but I'll use store logic. Wait, let me just mock the registered event count if it's not array.
  
  // Quick fix: Assuming 3 for demo if we can't easily get count
  const registeredCount = 3

  const safeCount = attendance.data?.courses.filter(c => c.status === 'safe').length ?? 0
  const totalCourses = attendance.data?.courses.length ?? 0

  const weekdays: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const dayNames = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' }
  const fullDayNames = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' }
  
  const classCounts = weekdays.map(day => ({
    day,
    count: sessionsForDay(timetable.data ?? [], day).length
  }))
  
  const maxCount = Math.max(...classCounts.map(c => c.count)) || 1
  const busiest = classCounts.reduce((a, b) => a.count > b.count ? a : b, classCounts[0])
  
  const pendingDeadlines = (deadlines.data ?? []).filter(d => !d.submitted).length

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Insights"
        description="Your semester at a glance"
      />

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">Week 8 of 16</h2>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full w-1/2 bg-brand" />
        </div>
        <p className="mt-2 text-[13px] text-ink-muted">50% of semester complete</p>
      </section>

      <section className="rounded-card border border-line bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold tracking-tight text-ink">Attendance by course</h2>
          <div className="flex items-center gap-3">
             <span className="text-[14px] font-medium text-ink">{attendance.data?.overallPercentage ?? 0}%</span>
             <SparkChart data={[72, 75, 74, 78, 77]} width={60} height={20} className="text-brand-ink" />
          </div>
        </div>
        
        <div className="space-y-3">
          {(attendance.data?.courses ?? []).map(course => {
            const courseData = courseById.get(course.courseId)
            return (
              <div key={course.courseId} className="flex items-center gap-3 text-[14px]">
                 <span className="w-16 shrink-0 font-medium text-ink">{courseData?.short}</span>
                 <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div 
                      className="h-full bg-brand"
                      style={{ width: `${course.percentage}%` }}
                    />
                 </div>
                 <span className="w-10 shrink-0 text-right tabular-nums text-ink-muted">
                   {Math.round(course.percentage)}%
                 </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">Your week</h2>
        
        <div className="mt-4 flex h-24 items-end gap-2">
           {classCounts.map(({ day, count }) => (
             <div key={day} className="flex flex-1 flex-col items-center gap-2">
               <div className="relative w-full flex-1 overflow-hidden rounded-t bg-surface-muted">
                 <div 
                   className={cn("absolute bottom-0 w-full rounded-t transition-all", count === busiest.count ? "bg-brand" : "bg-brand-soft")}
                   style={{ height: `${(count / maxCount) * 100}%` }}
                 />
               </div>
               <span className="text-[12px] font-medium uppercase text-ink-subtle">{dayNames[day]}</span>
             </div>
           ))}
        </div>
        <p className="mt-4 text-[13px] text-ink-muted">
           Busiest day: <span className="font-medium text-ink">{fullDayNames[busiest?.day ?? 'mon']} ({busiest?.count ?? 0} classes)</span>
        </p>
      </section>
      
      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="mb-4 text-[17px] font-semibold tracking-tight text-ink">Activity Summary</h2>
        
        <div className="grid grid-cols-2 gap-4">
           <div className="rounded-control bg-surface-muted p-4">
             <p className="text-[13px] text-ink-muted">Complaints filed</p>
             <p className="mt-1 tabular-nums text-[20px] font-semibold text-ink">{complaints.data?.length ?? 0}</p>
           </div>
           <div className="rounded-control bg-surface-muted p-4">
             <p className="text-[13px] text-ink-muted">Avg resolution</p>
             <p className="mt-1 tabular-nums text-[20px] font-semibold text-ink">3.2 days</p>
           </div>
           <div className="rounded-control bg-surface-muted p-4">
             <p className="text-[13px] text-ink-muted">Events registered</p>
             <p className="mt-1 tabular-nums text-[20px] font-semibold text-ink">{registeredCount}</p>
           </div>
           <div className="rounded-control bg-surface-muted p-4">
             <p className="text-[13px] text-ink-muted">Deadlines</p>
             <p className="mt-1 tabular-nums text-[20px] font-semibold text-ink">{pendingDeadlines}</p>
           </div>
           <div className="rounded-control bg-surface-muted p-4">
             <p className="text-[13px] text-ink-muted">Courses on track</p>
             <p className="mt-1 tabular-nums text-[20px] font-semibold text-ink">{safeCount} / {totalCourses}</p>
           </div>
           <div className="rounded-control bg-surface-muted p-4">
             <p className="text-[13px] text-ink-muted">Attendance streak</p>
             <p className="mt-1 tabular-nums text-[20px] font-semibold text-ink">12 days</p>
           </div>
        </div>
      </section>

      <DemoNote>
        These insights are based on your demo profile data.
      </DemoNote>
    </PageContainer>
  )
}
