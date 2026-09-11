import { daysUntil, toDate } from '@/lib/utils'
import type { Exam, ExamKind, ExamSchedule } from '@/types'

/**
 * Examination arithmetic.
 *
 * The backend is expected to return the paper list and, separately, whatever
 * seat allocations have been published. Everything the UI reads off them —
 * which exam is next, how long a paper runs, whether seating is out yet — is
 * derived here so the schedule screen, the dashboard signal, the command
 * palette and the assistant cannot disagree.
 */

export const examKindLabel: Record<ExamKind, string> = {
  'mid-term': 'Mid-term',
  'end-term': 'End-term',
  practical: 'Practical',
}

/** Sort key: the exact moment a paper starts. */
function startsAt(exam: Exam) {
  return toDate(exam.date, exam.startTime).getTime()
}

export function examDurationMinutes(exam: Exam) {
  const [sh, sm] = exam.startTime.split(':').map(Number)
  const [eh, em] = exam.endTime.split(':').map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

/** "3 hours" / "2h 30m" — the way an exam length is actually spoken. */
export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  return `${hours}h ${rest}m`
}

/**
 * How close an exam is, as a tone.
 *
 * An exam a fortnight out is information; one inside a week is something to be
 * organising around; one tomorrow is the only thing that matters.
 */
export function examTone(exam: Exam, at = new Date()): 'info' | 'warn' | 'danger' {
  const days = daysUntil(exam.date, at)
  if (days <= 1) return 'danger'
  if (days <= 7) return 'warn'
  return 'info'
}

/**
 * Builds the schedule.
 *
 * A paper is "past" once its end time has gone, not once its date has — an exam
 * finishing at 1pm should not still be advertised as next at 3pm.
 */
export function buildExamSchedule(
  exams: Exam[],
  at = new Date(),
  source: ExamSchedule['source'] = 'demo',
): ExamSchedule {
  const ordered = [...exams].sort((a, b) => startsAt(a) - startsAt(b))

  const next = ordered.find((exam) => toDate(exam.date, exam.endTime).getTime() > at.getTime())

  return {
    exams: ordered,
    next,
    seatsPublished: ordered.filter((exam) => exam.seat).length,
    source,
  }
}

/**
 * How long before a paper its seat allocation appears.
 *
 * **A demo figure**, not an institutional rule — stated as such wherever the
 * product explains why a seat is missing, for the same reason the 75%
 * attendance threshold is.
 */
export const DEMO_SEATING_RELEASE_DAYS = 10
