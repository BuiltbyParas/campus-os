import { courseById, deadlineKindLabel } from '@/data'
import type { AgendaItem, CampusEvent, ClassSession, Deadline } from '@/types'

import { formatTime } from './utils'

/**
 * Builds the student's day as one chronological list.
 *
 * Classes, coursework deadlines and campus events live in three different
 * services, but a student experiences them as a single day. Merging them here —
 * rather than stacking three lists in the UI — is the whole point of the Today
 * view: it is what lets CampusOS say "your next thing is X" instead of making
 * the student cross-reference a timetable against a deadline list.
 *
 * Gaps longer than `GAP_THRESHOLD_MINUTES` between classes become explicit
 * "free period" entries, because an unscheduled hour is information too.
 */

const GAP_THRESHOLD_MINUTES = 45

export function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function describeGap(minutes: number) {
  if (minutes >= 120) {
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest === 0 ? `${hours} hours free` : `${hours}h ${rest}m free`
  }
  return `${minutes} minutes free`
}

function statusFor(startMinutes: number, endMinutes: number, nowMinutes: number) {
  if (nowMinutes >= endMinutes) return 'past' as const
  if (nowMinutes >= startMinutes) return 'now' as const
  return 'upcoming' as const
}

export function buildDayAgenda({
  sessions,
  deadlines,
  events,
  isoDate,
  at = new Date(),
}: {
  /** Sessions already filtered to the day being rendered. */
  sessions: ClassSession[]
  deadlines: Deadline[]
  events: CampusEvent[]
  /** The ISO date of the day being rendered, used to filter dated records. */
  isoDate: string
  at?: Date
}): AgendaItem[] {
  const nowMinutes = at.getHours() * 60 + at.getMinutes()
  const items: AgendaItem[] = []

  for (const session of sessions) {
    const course = courseById.get(session.courseId)
    const start = toMinutes(session.startTime)
    const end = toMinutes(session.endTime)
    items.push({
      id: session.id,
      kind: 'class',
      startTime: session.startTime,
      endTime: session.endTime,
      title: course?.name ?? 'Class',
      subtitle: `${session.block} · ${session.room}`,
      minutesUntil: start - nowMinutes,
      status: statusFor(start, end, nowMinutes),
      to: '/app/timetable',
    })
  }

  for (const deadline of deadlines) {
    if (deadline.date !== isoDate || deadline.submitted) continue
    const course = courseById.get(deadline.courseId)
    const due = toMinutes(deadline.dueTime)
    items.push({
      id: deadline.id,
      kind: 'deadline',
      startTime: deadline.dueTime,
      title: deadline.title,
      subtitle: `${deadlineKindLabel[deadline.kind]} · ${course?.short ?? ''}`.trim(),
      minutesUntil: due - nowMinutes,
      status: nowMinutes >= due ? 'past' : 'upcoming',
    })
  }

  for (const event of events) {
    if (event.date !== isoDate) continue
    const start = toMinutes(event.startTime)
    const end = toMinutes(event.endTime)
    items.push({
      id: event.id,
      kind: 'event',
      startTime: event.startTime,
      endTime: event.endTime,
      title: event.title,
      subtitle: event.venue,
      minutesUntil: start - nowMinutes,
      status: statusFor(start, end, nowMinutes),
      to: '/app/events',
    })
  }

  items.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))

  /* Insert free periods between consecutive classes. Only classes create gaps —
     a deadline does not occupy the room between two lectures. */
  const withGaps: AgendaItem[] = []
  for (let i = 0; i < items.length; i += 1) {
    withGaps.push(items[i])
    if (items[i].kind !== 'class' || !items[i].endTime) continue

    const nextClass = items.slice(i + 1).find((item) => item.kind === 'class')
    if (!nextClass) continue

    const gapStart = toMinutes(items[i].endTime!)
    const gapEnd = toMinutes(nextClass.startTime)
    const gap = gapEnd - gapStart
    if (gap < GAP_THRESHOLD_MINUTES) continue

    withGaps.push({
      id: `gap_${items[i].id}`,
      kind: 'gap',
      startTime: items[i].endTime!,
      endTime: nextClass.startTime,
      title: 'Free period',
      subtitle: describeGap(gap),
      minutesUntil: gapStart - nowMinutes,
      status: statusFor(gapStart, gapEnd, nowMinutes),
    })
  }

  withGaps.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))

  /* Exactly one entry is "next": the first thing still ahead. Marking it here
     keeps every consumer from re-deriving it and disagreeing. */
  const nextIndex = withGaps.findIndex((item) => item.status === 'upcoming')
  if (nextIndex >= 0) withGaps[nextIndex] = { ...withGaps[nextIndex], status: 'next' }

  return withGaps
}

/** Human phrasing for a countdown, e.g. "in 42 min" / "in 2h 10m". */
export function countdown(minutes: number) {
  if (minutes <= 0) return 'now'
  if (minutes < 60) return `in ${Math.round(minutes)} min`
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  return rest === 0 ? `in ${hours}h` : `in ${hours}h ${rest}m`
}

export { formatTime }
