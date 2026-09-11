import { courseById, deadlineKindLabel, deadlines as demoDeadlines } from '@/data'
import { countdown, toMinutes } from '@/lib/agenda'
import { formatTime } from '@/lib/utils'
import type {
  AttendanceSummary,
  ClassSession,
  Complaint,
  Deadline,
  Insight,
  Signal,
  Weekday,
} from '@/types'

import { findNextSession, sessionsForDay } from './academics'
import { request } from './http'

/**
 * The proactive layer.
 *
 * This is the difference between a portal and an operating layer: a portal
 * waits to be asked, this notices. Every signal is *derived* from a record the
 * student already has — none are authored — so CampusOS can never nag about
 * something that is not true, and each one carries the action that resolves it.
 *
 * Signals are scored by urgency and the UI shows only the top few. Surfacing
 * everything would be the same as surfacing nothing.
 */

export function listDeadlines(): Promise<Deadline[]> {
  return request('/deadlines', () => demoDeadlines)
}

/** Minutes between now and a time-of-day on a given ISO date. */
function minutesUntilOn(isoDate: string, time: string, at: Date) {
  const [hours, minutes] = time.split(':').map(Number)
  const target = new Date(`${isoDate}T00:00:00`)
  target.setHours(hours, minutes, 0, 0)
  return (target.getTime() - at.getTime()) / 60_000
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function buildSignals({
  attendance,
  sessions,
  complaints,
  deadlines,
  at = new Date(),
}: {
  attendance?: AttendanceSummary
  sessions: ClassSession[]
  complaints: Complaint[]
  deadlines: Deadline[]
  at?: Date
}): Signal[] {
  const signals: Signal[] = []
  const today = isoDate(at)
  const nowMinutes = at.getHours() * 60 + at.getMinutes()

  /* ---------------------------------------------------------- next class */
  const next = findNextSession(sessions, at)
  if (next?.isToday) {
    const course = courseById.get(next.session.courseId)
    const until = toMinutes(next.session.startTime) - nowMinutes
    const running = until <= 0

    // Only worth interrupting for once it is close enough to act on.
    if (until <= 90) {
      signals.push({
        id: `sig_class_${next.session.id}`,
        tone: running ? 'ok' : until <= 20 ? 'warn' : 'info',
        title: running
          ? `${course?.short ?? 'Class'} is running now`
          : `${course?.short ?? 'Class'} starts ${countdown(until)}`,
        detail: `${next.session.block} · ${next.session.room} · ${formatTime(next.session.startTime)}`,
        urgency: running ? 80 : 100 - until,
        action: { label: 'View timetable', to: '/app/timetable' },
        source: 'timetable',
      })
    }
  }

  /* ---------------------------------------------------------- attendance */
  const below = (attendance?.courses ?? []).filter((row) => row.status === 'below')
  for (const row of below) {
    const course = courseById.get(row.courseId)
    signals.push({
      id: `sig_att_${row.courseId}`,
      tone: 'danger',
      title: `${course?.short ?? 'A course'} attendance is ${Math.round(row.percentage)}%`,
      detail: `Below the ${row.requiredPercentage}% demo threshold. Attending the next ${row.mustAttend} brings it back.`,
      urgency: 95,
      action: { label: 'View attendance', to: '/app/attendance' },
      source: 'attendance',
    })
  }

  /* A course that is above the line but one absence from dropping below is
     worth a quieter word — it is the one a student can still protect. */
  const atRisk = (attendance?.courses ?? []).filter(
    (row) => row.status === 'at-risk' && row.canMiss === 0,
  )
  for (const row of atRisk.slice(0, 1)) {
    const course = courseById.get(row.courseId)
    signals.push({
      id: `sig_risk_${row.courseId}`,
      tone: 'warn',
      title: `${course?.short ?? 'A course'} has no margin left`,
      detail: `At ${Math.round(row.percentage)}%. One more absence drops it below ${row.requiredPercentage}%.`,
      urgency: 60,
      action: { label: 'View attendance', to: '/app/attendance' },
      source: 'attendance',
    })
  }

  /* ----------------------------------------------------------- deadlines */
  const tomorrow = isoDate(new Date(at.getTime() + 86_400_000))
  for (const deadline of deadlines) {
    if (deadline.submitted) continue
    if (deadline.date !== today && deadline.date !== tomorrow) continue

    const course = courseById.get(deadline.courseId)
    const minutes = minutesUntilOn(deadline.date, deadline.dueTime, at)
    if (minutes < 0) continue

    const isToday = deadline.date === today
    signals.push({
      id: `sig_dln_${deadline.id}`,
      tone: isToday ? 'danger' : 'warn',
      title: `${deadlineKindLabel[deadline.kind]} due ${isToday ? countdown(minutes) : 'tomorrow'}`,
      detail: `${deadline.title} · ${course?.short ?? ''}`.trim(),
      urgency: isToday ? 92 : 70,
      action: { label: 'View timetable', to: '/app/timetable' },
      source: 'deadline',
    })
  }

  /* ---------------------------------------------------------- complaints */
  const awaiting = complaints.filter((complaint) => complaint.stage === 'verification')
  for (const complaint of awaiting) {
    signals.push({
      id: `sig_cmp_${complaint.id}`,
      tone: 'warn',
      title: 'A request needs your confirmation',
      detail: `${complaint.reference} · ${complaint.title}`,
      urgency: 75,
      action: { label: 'Review request', to: `/app/complaints/${complaint.id}` },
      source: 'complaint',
    })
  }

  /* A complaint that moved in the last day is worth mentioning once. */
  const recentlyUpdated = complaints.filter((complaint) => {
    if (complaint.stage === 'resolved' || complaint.stage === 'verification') return false
    const hours = (at.getTime() - new Date(complaint.updatedAt).getTime()) / 3_600_000
    return hours <= 24
  })
  for (const complaint of recentlyUpdated.slice(0, 1)) {
    const last = complaint.timeline[complaint.timeline.length - 1]
    signals.push({
      id: `sig_cmpupd_${complaint.id}`,
      tone: 'info',
      title: `${complaint.reference} was updated`,
      detail: last?.description ?? complaint.title,
      urgency: 45,
      action: { label: 'Track request', to: `/app/complaints/${complaint.id}` },
      source: 'complaint',
    })
  }

  return signals.sort((a, b) => b.urgency - a.urgency)
}

/* ------------------------------------------------------------- insights */

/**
 * Small derived observations about the student's own week.
 *
 * Deliberately limited to things the demo dataset can actually support — no
 * inferred behaviour, no profiling, nothing the student did not already tell
 * the system by attending a class or filing a request.
 */
export function buildInsights({
  attendance,
  sessions,
  complaints,
  deadlines,
  at = new Date(),
}: {
  attendance?: AttendanceSummary
  sessions: ClassSession[]
  complaints: Complaint[]
  deadlines: Deadline[]
  at?: Date
}): Insight[] {
  const insights: Insight[] = []

  /* Busiest teaching day, straight from the timetable. */
  const weekdays: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const counts = weekdays.map((day) => ({ day, count: sessionsForDay(sessions, day).length }))
  const busiest = [...counts].sort((a, b) => b.count - a.count)[0]
  if (busiest && busiest.count > 0) {
    const names: Record<Weekday, string> = {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
    }
    insights.push({
      label: 'Busiest day',
      value: names[busiest.day],
      detail: `${busiest.count} classes`,
    })
  }

  /* Tomorrow's class count — the question students actually ask at night. */
  const tomorrowIndex = (at.getDay() + 1) % 7
  const tomorrowDay = weekdays[tomorrowIndex - 1 >= 0 ? tomorrowIndex - 1 : 5]
  const tomorrowCount = tomorrowDay ? sessionsForDay(sessions, tomorrowDay).length : 0
  insights.push({
    label: 'Tomorrow',
    value: `${tomorrowCount} ${tomorrowCount === 1 ? 'class' : 'classes'}`,
  })

  const open = complaints.filter((complaint) => complaint.stage !== 'resolved').length
  insights.push({
    label: 'Open requests',
    value: String(open),
    tone: open > 0 ? 'info' : 'ok',
  })

  const pending = deadlines.filter((deadline) => !deadline.submitted).length
  insights.push({
    label: 'Coursework due',
    value: `${pending} ${pending === 1 ? 'item' : 'items'}`,
    tone: pending > 2 ? 'warn' : 'info',
  })

  if (attendance) {
    const safe = attendance.courses.filter((row) => row.status === 'safe').length
    insights.push({
      label: 'Courses on track',
      value: `${safe} of ${attendance.courses.length}`,
      tone: safe === attendance.courses.length ? 'ok' : 'warn',
    })
  }

  return insights
}
