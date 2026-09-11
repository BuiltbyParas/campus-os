import { courseById, toLocalIsoDate } from '@/data'
import { formatTime } from '@/lib/utils'
import { sessionsForDay, weekdayFromDate } from '@/services/academics'
import type { AttendanceSummary, ClassSession, Complaint, Deadline } from '@/types'

export function buildContextLine(ctx: {
  attendance?: AttendanceSummary
  sessions: ClassSession[]
  complaints: Complaint[]
  deadlines: Deadline[]
  at?: Date
}): string {
  const at = ctx.at || new Date()
  const today = weekdayFromDate(at)
  const todaySessions = today ? sessionsForDay(ctx.sessions, today) : []
  const count = todaySessions.length

  // 1. Attendance below threshold
  if (ctx.attendance) {
    const below = ctx.attendance.courses.find((c) => c.status === 'below')
    if (below) {
      const course = courseById.get(below.courseId)
      const short = course?.short ?? 'Course'
      return `${short} attendance is ${Math.round(below.percentage)}% — attend the next ${below.mustAttend} to recover.`
    }
  }

  // 2. Complaint updated in last 6 hours
  const recentComplaint = ctx.complaints.find((c) => {
    const hours = (at.getTime() - new Date(c.updatedAt).getTime()) / 3_600_000
    return hours <= 6 && hours >= 0
  })
  if (recentComplaint) {
    return `${count} classes today. Your ${recentComplaint.title} was updated.`
  }

  // 3. Deadline due today
  const todayIso = toLocalIsoDate(at)
  const dueToday = ctx.deadlines.find((d) => d.date === todayIso && !d.submitted)
  if (dueToday) {
    return `${count} classes today. ${dueToday.title} is due by ${formatTime(dueToday.dueTime)}.`
  }

  // 4. No classes today
  if (count === 0) {
    return 'No classes today. Enjoy the break.'
  }

  // 5. Light day <= 2 classes
  if (count <= 2) {
    let hint = ''
    if (ctx.attendance) {
      const weakest = [...ctx.attendance.courses].sort((a, b) => a.percentage - b.percentage)[0]
      if (weakest && weakest.percentage < 100) {
        const c = courseById.get(weakest.courseId)
        if (c) {
          hint = ` Focus on ${c.short}.`
        }
      }
    }
    return `Light day — ${count} classes.${hint}`
  }

  // 6. Default
  return `${count} classes today.`
}
