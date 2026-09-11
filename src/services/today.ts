import { toLocalIsoDate, type Announcement } from '@/data'
import { buildDayAgenda } from '@/lib/agenda'
import type {
  AgendaItem,
  AttendanceSummary,
  CampusEvent,
  ClassSession,
  Complaint,
  CourseAttendance,
  Deadline,
  EduProgress,
  ExamSchedule,
  FeeSummary,
  Insight,
  ResultsSummary,
  Signal,
} from '@/types'

import {
  getAttendance,
  getResults,
  listSessions,
  sessionsForDay,
  weekdayFromDate,
  withStatus,
} from './academics'
import { getEduProgress } from './campusLife'
import { getExams } from './examinations'
import { getFees } from './finance'
import { listEvents, listNotifications } from './campus'
import { listComplaints } from './complaints'
import { requestAsync } from './http'
import {
  buildInsights,
  buildPulse,
  buildSignals,
  buildSmartActions,
  buildTodaySummary,
  listAnnouncements,
  listDeadlines,
  type PulseItem,
  type SmartAction,
} from './signals'

/**
 * `GET /api/today` — the dashboard's view model, assembled in one place.
 *
 * The Today screen is not a list of four widgets; it is one derived answer to
 * "what does today look like?", and every part of it has to agree with every
 * other part. Composing it here rather than in the page means the header's
 * summary, the Now/Next pair, the timeline and the signals are all computed
 * from a single snapshot of a single clock — a component that re-derived them
 * would eventually show a class in one block that the block beside it had
 * already moved past.
 *
 * It also keeps the page free of business logic. `Dashboard.tsx` renders
 * `TodayView`; it does not know what a "signal" is or when a course counts as
 * at risk.
 */

export interface TodayView {
  /** Local calendar date this view describes. */
  date: string
  /** The header's one-line brief, already counted. Empty when nothing is on. */
  summary: string[]
  /** Every class, deadline, event and free period today, in order. */
  agenda: AgendaItem[]
  /** Today's classes only — the subset the core and the counts read from. */
  todaySessions: ClassSession[]
  now?: AgendaItem
  next?: AgendaItem
  /** The item after `next` — what the rest of the day holds. */
  later?: AgendaItem
  signals: Signal[]
  smartActions: SmartAction[]
  insights: Insight[]
  pulse: PulseItem[]
  attendance?: AttendanceSummary
  /** Lowest-attendance course, surfaced by the attendance panel. */
  weakestCourse?: CourseAttendance
  /** Requests that have not reached `resolved`. */
  openRequests: Complaint[]
  fees?: FeeSummary
  results?: ResultsSummary
  edu?: EduProgress
  exams?: ExamSchedule
}

export interface TodayInput {
  attendance?: AttendanceSummary
  /** The full weekly timetable — statuses are derived here, not by the caller. */
  timetable: ClassSession[]
  complaints: Complaint[]
  deadlines: Deadline[]
  events: CampusEvent[]
  notices: Announcement[]
  fees?: FeeSummary
  results?: ResultsSummary
  edu?: EduProgress
  exams?: ExamSchedule
  at?: Date
}

/**
 * Pure composition. No fetching, no clock of its own.
 *
 * Exported so the same derivation runs whether the data arrived from one
 * endpoint or five, and so it can be tested without a network.
 */
export function composeToday({
  attendance,
  timetable,
  complaints,
  deadlines,
  events,
  notices,
  fees,
  results,
  edu,
  exams,
  at = new Date(),
}: TodayInput): TodayView {
  const sessions = withStatus(timetable, at)
  const weekday = weekdayFromDate(at)
  const todaySessions = weekday ? sessionsForDay(sessions, weekday) : []
  const date = toLocalIsoDate(at)

  const agenda = buildDayAgenda({
    sessions: todaySessions,
    deadlines,
    events,
    isoDate: date,
    at,
  })

  /* Now/Next are read out of the same agenda the timeline renders, so they
     cannot disagree with the list directly beneath them. */
  const now = agenda.find((item) => item.status === 'now')
  const next = agenda.find((item) => item.status === 'next')
  /* The next substantial thing after `next`. Free periods are skipped: "later:
     free period" is not information a student needs carried up here. */
  const later = agenda.find(
    (item) => item.kind !== 'gap' && item !== next && item.status === 'upcoming',
  )

  /* Signals reason over the whole week, not just today: a class tomorrow
     morning is worth a warning tonight. */
  const context = { attendance, sessions, complaints, deadlines, fees, results, edu, exams, at }

  return {
    date,
    summary: buildTodaySummary({ sessions: todaySessions, deadlines, complaints, at }),
    agenda,
    todaySessions,
    now,
    next,
    later,
    signals: buildSignals(context),
    smartActions: buildSmartActions(context),
    insights: buildInsights(context),
    pulse: buildPulse({ deadlines, events, notices, at }),
    attendance,
    weakestCourse: attendance
      ? [...attendance.courses].sort((a, b) => a.percentage - b.percentage)[0]
      : undefined,
    openRequests: complaints.filter((complaint) => complaint.stage !== 'resolved'),
    fees,
    results,
    edu,
    exams,
  }
}

/**
 * Fetches the composed day.
 *
 * When the backend implements `/today` this returns its response directly and
 * the composition above becomes the server's job. Until then the fallback
 * gathers the same records the endpoint would read and composes them on the
 * client — identical shape, identical derivation, so the swap is invisible to
 * the UI.
 */
export function getToday(at = new Date()): Promise<TodayView> {
  return requestAsync<TodayView>('/today', async () => {
    const [attendance, timetable, complaints, deadlines, events, notices, fees, results, edu, exams] =
      await Promise.all([
        getAttendance(),
        listSessions(),
        listComplaints({ status: 'all' }),
        listDeadlines(),
        listEvents(),
        listAnnouncements(),
        getFees(),
        getResults(),
        getEduProgress(),
        getExams(),
      ])
    return composeToday({
      attendance,
      timetable,
      complaints,
      deadlines,
      events,
      notices,
      fees,
      results,
      edu,
      exams,
      at,
    })
  })
}

/** Unread count for the header bell. Separate because it changes far more often. */
export function unreadNotificationCount(): Promise<number> {
  return listNotifications().then((items) => items.filter((item) => !item.read).length)
}
