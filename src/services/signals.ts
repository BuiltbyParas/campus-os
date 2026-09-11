import {
  toLocalIsoDate,
  announcements as demoAnnouncements,
  courseById,
  deadlineKindLabel,
  deadlines as demoDeadlines,
  stageShortLabel,
  type Announcement,
} from '@/data'
import { countdown, toMinutes } from '@/lib/agenda'
import { examKindLabel, examTone } from '@/lib/exams'
import { formatMoney } from '@/lib/fees'
import { revaluationWindow } from '@/lib/results'
import { daysUntil, formatTime } from '@/lib/utils'
import type {
  AttendanceSummary,
  CampusEvent,
  ClassSession,
  Complaint,
  Deadline,
  EduProgress,
  ExamSchedule,
  FeeSummary,
  Insight,
  ResultsSummary,
  Signal,
  SignalTone,
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

export function listAnnouncements(): Promise<Announcement[]> {
  return request('/announcements', () => demoAnnouncements)
}

/** Minutes between now and a time-of-day on a given ISO date. */
function minutesUntilOn(isoDate: string, time: string, at: Date) {
  const [hours, minutes] = time.split(':').map(Number)
  const target = new Date(`${isoDate}T00:00:00`)
  target.setHours(hours, minutes, 0, 0)
  return (target.getTime() - at.getTime()) / 60_000
}

/** Local calendar date — see `toLocalIsoDate` for why UTC cannot be used. */
const isoDate = toLocalIsoDate

export function buildSignals({
  attendance,
  sessions,
  complaints,
  deadlines,
  fees,
  results,
  edu,
  exams,
  at = new Date(),
}: {
  attendance?: AttendanceSummary
  sessions: ClassSession[]
  complaints: Complaint[]
  deadlines: Deadline[]
  fees?: FeeSummary
  results?: ResultsSummary
  edu?: EduProgress
  exams?: ExamSchedule
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
        metric: running ? 'Now' : countdown(until).replace('in ', ''),
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
      metric: `${Math.round(row.percentage)}%`,
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
      metric: `${Math.round(row.percentage)}%`,
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
      metric: isToday ? 'Today' : 'Tomorrow',
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
      metric: stageShortLabel[complaint.stage],
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
      metric: stageShortLabel[complaint.stage],
      detail: last?.description ?? complaint.title,
      urgency: 45,
      action: { label: 'Track request', to: `/app/complaints/${complaint.id}` },
      source: 'complaint',
    })
  }

  /* ------------------------------------------------------- examinations */
  const nextExam = exams?.next
  if (nextExam) {
    const days = daysUntil(nextExam.date, at)
    const course = courseById.get(nextExam.courseId)

    /* Three weeks is the point at which revision becomes a plan rather than a
       worry, so that is when the exam starts appearing. */
    if (days <= 21) {
      const tone = examTone(nextExam, at)
      signals.push({
        id: `sig_exam_${nextExam.id}`,
        tone,
        title:
          days === 0
            ? `${course?.short ?? 'Exam'} ${examKindLabel[nextExam.kind].toLowerCase()} is today`
            : `${course?.short ?? 'Exam'} ${examKindLabel[nextExam.kind].toLowerCase()} in ${days} ${days === 1 ? 'day' : 'days'}`,
        /* The seat is the part a student cannot derive for themselves, so it
           leads the detail whenever it exists. */
        detail: nextExam.seat
          ? `${formatTime(nextExam.startTime)} · ${nextExam.seat.block} · ${nextExam.seat.room} · Seat ${nextExam.seat.seat}`
          : `${formatTime(nextExam.startTime)} · seat not released yet`,
        metric: days === 0 ? 'Today' : `${days}d`,
        urgency: days <= 1 ? 96 : days <= 7 ? 82 : 56,
        action: { label: 'View exams', to: '/app/exams' },
        source: 'exam',
      })
    }
  }

  /* ---------------------------------------------------------------- fees */
  const nextPayment = fees?.nextDue
  if (nextPayment) {
    const days = daysUntil(nextPayment.dueDate, at)
    /* Money is worth raising about three weeks out — early enough to arrange,
       late enough not to become wallpaper. */
    if (days <= 21) {
      const overdue = days < 0
      signals.push({
        id: `sig_fee_${nextPayment.id}`,
        tone: overdue ? 'danger' : days <= 7 ? 'warn' : 'info',
        title: overdue
          ? `${formatMoney(nextPayment.amount, fees.currency)} is overdue`
          : `${formatMoney(nextPayment.amount, fees.currency)} due in ${days} ${days === 1 ? 'day' : 'days'}`,
        detail: `${nextPayment.label} · demo fee record`,
        metric: formatMoney(nextPayment.amount, fees.currency),
        urgency: overdue ? 97 : days <= 7 ? 78 : 52,
        action: { label: 'View fees', to: '/app/fees' },
        source: 'fee',
      })
    }
  }

  /* ------------------------------------------------------------- results */
  const latest = results?.latest
  if (latest) {
    const publishedHoursAgo = (at.getTime() - new Date(latest.publishedAt).getTime()) / 3_600_000
    const course = courseById.get(latest.courseId)

    // A mark published in the last few days is news; older than that it is not.
    if (publishedHoursAgo <= 72) {
      signals.push({
        id: `sig_res_${latest.courseId}`,
        tone: 'info',
        title: `${course?.short ?? 'A course'} result published`,
        detail: `Now at ${Math.round(latest.percentage)}% across assessed work`,
        metric: `${Math.round(latest.percentage)}%`,
        urgency: 58,
        action: { label: 'View marks', to: '/app/academics' },
        source: 'result',
      })
    }

    /* A re-evaluation window is only worth raising where the mark is weak
       enough to make applying rational — otherwise it is noise attached to
       good news. */
    const window = revaluationWindow(latest, at)
    if (window.open && latest.percentage < 60) {
      signals.push({
        id: `sig_reval_${latest.courseId}`,
        tone: 'warn',
        title: `Re-evaluation closes in ${window.daysLeft} ${window.daysLeft === 1 ? 'day' : 'days'}`,
        detail: `${course?.short ?? 'A course'} · ${Math.round(latest.percentage)}% · demo window`,
        metric: `${window.daysLeft}d`,
        urgency: 68,
        action: { label: 'Review marks', to: '/app/academics' },
        source: 'result',
      })
    }
  }

  /* ------------------------------------------------------ EDU-Revolution */
  const nextActivity = edu?.nextRecommended
  if (edu && nextActivity && edu.completed < edu.required) {
    signals.push({
      id: `sig_edu_${nextActivity.id}`,
      tone: 'info',
      title: `EDU-Revolution ${edu.completed}/${edu.required} complete`,
      detail: `Next: ${nextActivity.title}`,
      metric: `${edu.completed}/${edu.required}`,
      urgency: 35,
      action: { label: 'View progress', to: '/app/academics' },
      source: 'edu',
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
  fees,
  edu,
  exams,
  at = new Date(),
}: {
  attendance?: AttendanceSummary
  sessions: ClassSession[]
  complaints: Complaint[]
  deadlines: Deadline[]
  fees?: FeeSummary
  edu?: EduProgress
  exams?: ExamSchedule
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
      /* A proportion is the one kind of figure a bar reads faster than text. */
      progress: (safe / Math.max(1, attendance.courses.length)) * 100,
    })
  }

  /* Money and the co-curricular track belong in the snapshot even when nothing
     is urgent about them — they are the two figures a student cannot see from
     any other block on the dashboard. */
  if (fees?.nextDue) {
    const days = daysUntil(fees.nextDue.dueDate, at)
    insights.push({
      label: 'Next payment',
      value: formatMoney(fees.nextDue.amount, fees.currency),
      detail: days < 0 ? 'Overdue' : `in ${days} ${days === 1 ? 'day' : 'days'}`,
      tone: days < 0 ? 'danger' : days <= 7 ? 'warn' : 'info',
      /* How much of the semester's fee is settled — the figure that makes the
         amount outstanding mean something. */
      progress: fees.totalPayable > 0 ? (fees.totalPaid / fees.totalPayable) * 100 : 0,
    })
  }

  if (exams?.next) {
    const days = daysUntil(exams.next.date, at)
    insights.push({
      label: 'Next exam',
      value: days === 0 ? 'Today' : `${days} ${days === 1 ? 'day' : 'days'}`,
      detail: courseById.get(exams.next.courseId)?.short ?? undefined,
      tone: days <= 1 ? 'danger' : days <= 7 ? 'warn' : 'info',
    })
  }

  if (edu) {
    insights.push({
      label: 'EDU-Revolution',
      value: `${edu.completed} of ${edu.required}`,
      detail: edu.nextRecommended ? 'Next activity ready' : 'Complete',
      tone: edu.completed >= edu.required ? 'ok' : 'info',
      progress: (edu.completed / Math.max(1, edu.required)) * 100,
    })
  }

  return insights
}


/* --------------------------------------------------------- smart actions */

export interface SmartAction {
  id: string
  label: string
  hint?: string
  to: string
  /** Higher sorts first. Context decides what a student is likely to want. */
  weight: number
}

/**
 * Actions that change with the situation.
 *
 * A fixed row of shortcuts is just a menu with bigger buttons. These are ranked
 * by what is actually true right now — a course below the threshold promotes
 * "ask whether you can skip", a request awaiting you promotes confirming it —
 * so the row is worth re-reading rather than becoming furniture.
 */
export function buildSmartActions({
  attendance,
  complaints,
  deadlines,
}: {
  attendance?: AttendanceSummary
  complaints: Complaint[]
  deadlines: Deadline[]
}): SmartAction[] {
  const actions: SmartAction[] = []

  /* The question a student with a shortfall is about to ask anyway. */
  const worst = (attendance?.courses ?? [])
    .filter((row) => row.status !== 'safe')
    .sort((a, b) => a.percentage - b.percentage)[0]
  if (worst) {
    const course = courseById.get(worst.courseId)
    actions.push({
      id: 'sa_skip',
      label: `Can I skip ${course?.short ?? 'this'}?`,
      hint: `${Math.round(worst.percentage)}% · ask the assistant`,
      to: `/app/assistant?q=${encodeURIComponent(`Can I skip my next ${course?.short ?? ''} class?`)}`,
      weight: 85,
    })
  }

  const awaiting = complaints.find((complaint) => complaint.stage === 'verification')
  if (awaiting) {
    actions.push({
      id: 'sa_verify',
      label: 'Confirm a repair',
      hint: awaiting.reference,
      to: `/app/complaints/${awaiting.id}`,
      weight: 80,
    })
  }

  const soonest = deadlines
    .filter((deadline) => !deadline.submitted)
    .sort((a, b) => `${a.date}${a.dueTime}`.localeCompare(`${b.date}${b.dueTime}`))[0]
  if (soonest) {
    const course = courseById.get(soonest.courseId)
    actions.push({
      id: 'sa_deadline',
      label: 'Next deadline',
      hint: `${course?.short ?? ''} · ${formatTime(soonest.dueTime)}`.trim(),
      to: '/app/timetable',
      weight: 60,
    })
  }

  /* Always available, and always last: reporting something is the one action
     that does not depend on anything already being true. */
  actions.push({
    id: 'sa_report',
    label: 'Report an issue',
    hint: 'Hostel, lab or facility',
    to: '/app/complaints/new',
    weight: 40,
  })

  return actions.sort((a, b) => b.weight - a.weight)
}

/* ----------------------------------------------------------- campus pulse */

export interface PulseItem {
  id: string
  when: string
  title: string
  detail: string
  tone: SignalTone
  kind: 'event' | 'deadline' | 'notice'
  action?: { label: string; to: string }
  /** Sort key: minutes from now. */
  order: number
}

/**
 * Campus Pulse — what is coming up on campus, in time order.
 *
 * Scoped deliberately to coursework, events and campus notices. The student's
 * own schedule is already carried by Now/Next and the timeline, and their own
 * requests by Recent activity — including them here would put the same row on
 * screen twice, which is how dashboards start feeling padded.
 *
 * Not a feed: finite, chronological, and every row is either something to
 * prepare for or something to act on.
 */
export function buildPulse({
  deadlines,
  events,
  notices,
  at = new Date(),
}: {
  deadlines: Deadline[]
  events: CampusEvent[]
  notices: Announcement[]
  at?: Date
}): PulseItem[] {
  const items: PulseItem[] = []
  const today = isoDate(at)
  const tomorrow = isoDate(new Date(at.getTime() + 86_400_000))

  for (const deadline of deadlines) {
    if (deadline.submitted) continue
    if (deadline.date !== today && deadline.date !== tomorrow) continue
    const course = courseById.get(deadline.courseId)
    const minutes = minutesUntilOn(deadline.date, deadline.dueTime, at)
    if (minutes < 0) continue
    items.push({
      id: `pulse_dln_${deadline.id}`,
      when: deadline.date === today ? countdown(minutes) : 'Tomorrow',
      title: deadline.title,
      detail: `${course?.short ?? ''} · due ${formatTime(deadline.dueTime)}`.trim(),
      tone: deadline.date === today ? 'danger' : 'warn',
      kind: 'deadline',
      order: minutes,
    })
  }

  for (const event of events) {
    if (event.date !== today && event.date !== tomorrow) continue
    const minutes = minutesUntilOn(event.date, event.startTime, at)
    if (minutes < 0) continue
    items.push({
      id: `pulse_evt_${event.id}`,
      when: event.date === today ? formatTime(event.startTime) : 'Tomorrow',
      title: event.title,
      detail: event.venue,
      tone: 'info',
      kind: 'event',
      action: { label: 'View', to: '/app/events' },
      order: minutes,
    })
  }

  for (const notice of notices) {
    if (notice.date !== today && notice.date !== tomorrow) continue
    const minutes = minutesUntilOn(notice.date, notice.startTime, at)
    // A notice stays relevant while it is in effect, not only before it starts.
    const endMinutes = notice.endTime
      ? minutesUntilOn(notice.date, notice.endTime, at)
      : minutes + 60
    if (endMinutes < 0) continue

    items.push({
      id: `pulse_ann_${notice.id}`,
      when: notice.date === today ? (minutes <= 0 ? 'In effect' : formatTime(notice.startTime)) : 'Tomorrow',
      title: notice.title,
      detail: notice.endTime
        ? `${notice.detail} · until ${formatTime(notice.endTime)}`
        : notice.detail,
      tone: minutes <= 0 && endMinutes > 0 ? 'warn' : 'info',
      kind: 'notice',
      order: minutes,
    })
  }

  return items.sort((a, b) => a.order - b.order)
}

/* ------------------------------------------------------- today's summary */

/**
 * The one-line answer to "what does today look like?".
 *
 * Every clause is counted from a real record, and a clause that would count
 * zero is dropped rather than printed as "0 deadlines" — a summary listing
 * things that are not happening is noise. When nothing at all is scheduled the
 * caller gets an empty array and can say so in its own words.
 */
export function buildTodaySummary({
  sessions,
  deadlines,
  complaints,
  at = new Date(),
}: {
  /** Sessions already filtered to today. */
  sessions: ClassSession[]
  deadlines: Deadline[]
  complaints: Complaint[]
  at?: Date
}): string[] {
  const parts: string[] = []
  const today = isoDate(at)
  const tomorrow = isoDate(new Date(at.getTime() + 86_400_000))

  if (sessions.length > 0) {
    parts.push(`${sessions.length} ${sessions.length === 1 ? 'class' : 'classes'} today`)
  }

  const pending = deadlines.filter((deadline) => !deadline.submitted)
  const dueToday = pending.filter((deadline) => deadline.date === today).length
  const dueTomorrow = pending.filter((deadline) => deadline.date === tomorrow).length

  if (dueToday > 0) {
    parts.push(`${dueToday} ${dueToday === 1 ? 'deadline' : 'deadlines'} today`)
  }
  if (dueTomorrow > 0) {
    parts.push(`${dueTomorrow} ${dueTomorrow === 1 ? 'deadline' : 'deadlines'} tomorrow`)
  }

  const open = complaints.filter((complaint) => complaint.stage !== 'resolved').length
  if (open > 0) {
    parts.push(`${open} active ${open === 1 ? 'request' : 'requests'}`)
  }

  return parts
}
