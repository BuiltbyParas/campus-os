import {
  attendanceSummary,
  courses,
  demoStudent,
  timetable,
  weekdays,
} from '@/data'
import type {
  AttendanceSummary,
  ClassSession,
  Course,
  SessionStatus,
  Student,
  Weekday,
} from '@/types'

import { request } from './http'

/**
 * Student, courses, attendance and timetable reads.
 *
 * Every function goes through `request()`, which calls the API and falls back
 * to demo data on any failure. Swapping in a real backend means changing the
 * paths here and nothing else.
 */

export function getStudent(): Promise<Student> {
  return request('/me', () => demoStudent)
}

export function listCourses(): Promise<Course[]> {
  return request('/courses', () => courses)
}

export function getAttendance(): Promise<AttendanceSummary> {
  return request('/attendance', () => attendanceSummary)
}

/* -------------------------------------------------------------- timetable */

const DAY_INDEX: Record<Weekday, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
}

export function weekdayFromDate(date: Date): Weekday | null {
  const day = date.getDay()
  return (weekdays.find((weekday) => DAY_INDEX[weekday] === day) as Weekday | undefined) ?? null
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Attaches completed / ongoing / upcoming against the supplied clock.
 *
 * Status is never stored on the session — it is a function of *when you look*,
 * so it is derived on read and stays correct whenever the app is opened.
 */
export function withStatus(sessions: ClassSession[], at = new Date()): ClassSession[] {
  const today = weekdayFromDate(at)
  const nowMinutes = at.getHours() * 60 + at.getMinutes()

  return sessions.map((session) => {
    if (session.status === 'cancelled') return session
    if (session.day !== today) return { ...session, status: 'upcoming' as SessionStatus }

    const start = toMinutes(session.startTime)
    const end = toMinutes(session.endTime)

    let status: SessionStatus = 'upcoming'
    if (nowMinutes >= end) status = 'completed'
    else if (nowMinutes >= start) status = 'ongoing'

    return { ...session, status }
  })
}

export function listSessions(): Promise<ClassSession[]> {
  return request('/timetable', () => timetable)
}

export function sortByStart(sessions: ClassSession[]) {
  return [...sessions].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
}

export function sessionsForDay(sessions: ClassSession[], day: Weekday) {
  return sortByStart(sessions.filter((session) => session.day === day))
}

/**
 * The next class the student has, looking forward from `at` and rolling into
 * following days when today is finished. Returns null only when the timetable
 * is genuinely empty.
 */
export function findNextSession(
  sessions: ClassSession[],
  at = new Date(),
): { session: ClassSession; day: Weekday; isToday: boolean } | null {
  if (sessions.length === 0) return null

  const today = weekdayFromDate(at)
  const nowMinutes = at.getHours() * 60 + at.getMinutes()

  if (today) {
    const remaining = sessionsForDay(sessions, today).find(
      (session) => toMinutes(session.endTime) > nowMinutes,
    )
    if (remaining) return { session: remaining, day: today, isToday: true }
  }

  // Walk forward through the teaching week, wrapping around at the end.
  const startIndex = today ? weekdays.indexOf(today) : -1
  for (let step = 1; step <= weekdays.length; step += 1) {
    const day = weekdays[(startIndex + step + weekdays.length) % weekdays.length]
    const first = sessionsForDay(sessions, day)[0]
    if (first) return { session: first, day, isToday: false }
  }

  return null
}
