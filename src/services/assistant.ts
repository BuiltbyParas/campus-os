import {
  courseById,
  courses,
  stageLabel,
  toLocalIsoDate,
  weekdayLabel,
  weekdayShort,
} from '@/data'
import { classesCanMiss, classesMustAttend, percentage } from '@/lib/attendance'
import { formatDateLabel, formatTime, uid } from '@/lib/utils'
import type {
  AssistantDataPoint,
  AssistantSource,
  AttendanceSummary,
  ChatMessage,
  Complaint,
  CampusEvent,
  ClassSession,
  Course,
  Deadline,
} from '@/types'

import {
  findNextSession,
  getAttendance,
  listSessions,
  sessionsForDay,
  weekdayFromDate,
} from './academics'
import { listEvents, listNotifications } from './campus'
import { listComplaints } from './complaints'
import { listDeadlines } from './signals'

/**
 * The CampusOS assistant.
 *
 * This is deliberately *not* a general chatbot. It recognises a small set of
 * questions a student actually asks, answers them from that student's own
 * records, and shows both the figures it used and where they came from.
 *
 * Two rules it must never break:
 *  1. Every number in an answer is computed from campus data, never written by
 *     hand — so the assistant can never contradict the attendance screen.
 *  2. The minimum-attendance figure is a DEMO rule and is always labelled as
 *     one. The assistant never states an institutional policy as fact.
 *
 * When a real language model is wired in, it replaces `composeAnswer` only:
 * the retrieval below becomes the model's context, and `sources` stays exactly
 * as it is so answers remain inspectable.
 */

const ROUND = (value: number) => Math.round(value)

/* ------------------------------------------------------------------ intent */

type Intent =
  | 'skip'
  | 'attendance'
  | 'next-class'
  | 'complaints'
  | 'events'
  | 'deadlines'
  | 'day'
  | 'unknown'

function detectIntent(text: string): Intent {
  if (/\b(skip|miss|bunk|leave out|not attend|not go)\b/.test(text)) return 'skip'
  if (/\b(deadline|due|assignment|submission|coursework|homework|quiz)\b/.test(text))
    return 'deadlines'
  if (/\b(my day|today|what'?s on|whats on|agenda|plan)\b/.test(text)) return 'day'
  if (/\b(attendance|percentage|shortage|short of|how many classes)\b/.test(text)) return 'attendance'
  if (/\b(next class|what'?s next|whats next|today'?s classes|timetable|schedule|lecture)\b/.test(text))
    return 'next-class'
  if (/\b(complaint|issue|repair|ticket|ac|wifi|wi-fi|request|cmp-)\b/.test(text)) return 'complaints'
  if (/\b(event|events|happening|fest|workshop|talk)\b/.test(text)) return 'events'
  return 'unknown'
}

/** Extra names students actually use, beyond the official course title. */
const courseAliases: Record<string, string[]> = {
  crs_dbms: ['dbms', 'database', 'databases'],
  crs_cn: ['cn', 'networks', 'networking', 'computer networks'],
  crs_c: ['c', 'c programming', 'programming in c', 'c prog'],
  crs_math: ['math', 'maths', 'mathematics'],
  crs_web: ['web', 'web dev', 'web development', 'webdev'],
}

function detectCourse(text: string): Course | null {
  let best: { course: Course; length: number } | null = null

  for (const course of courses) {
    const candidates = [
      course.name.toLowerCase(),
      course.short.toLowerCase(),
      course.code.toLowerCase(),
      ...(courseAliases[course.id] ?? []),
    ]
    for (const candidate of candidates) {
      if (!new RegExp(`\\b${candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text)) {
        continue
      }
      if (!best || candidate.length > best.length) best = { course, length: candidate.length }
    }
  }

  return best?.course ?? null
}

/* ----------------------------------------------------------------- sources */

function attendanceSource(
  course: Course | null,
  summary: AttendanceSummary,
): AssistantSource {
  if (course) {
    const row = summary.courses.find((entry) => entry.courseId === course.id)
    return {
      kind: 'attendance',
      label: 'Your attendance record',
      detail: row
        ? `${row.attended} of ${row.held} ${course.short} classes attended`
        : `${course.name}`,
      source: summary.source,
    }
  }
  return {
    kind: 'attendance',
    label: 'Your attendance record',
    detail: `${summary.totalAttended} of ${summary.totalHeld} classes attended this semester`,
    source: summary.source,
  }
}

const requirementSource: AssistantSource = {
  kind: 'policy',
  label: 'Minimum attendance',
  detail: '75% — a demo figure for this prototype, not an official rule',
  source: 'demo',
}

function timetableSource(session: ClassSession | null): AssistantSource {
  return {
    kind: 'timetable',
    label: 'Your timetable',
    detail: session
      ? `${weekdayLabel[session.day]} · ${formatTime(session.startTime)} · ${session.block} ${session.room}`
      : 'Semester 2 weekly schedule',
    source: 'demo',
  }
}

/**
 * Summarises when a course actually meets, e.g. "Mon, Wed, Fri at 10 AM".
 * Citing one arbitrary session would imply the assistant had a specific class
 * in mind when it did not.
 */
function courseScheduleSource(course: Course, sessions: ClassSession[]): AssistantSource {
  const mine = sessions.filter((session) => session.courseId === course.id)
  if (mine.length === 0) {
    return { kind: 'timetable', label: 'Your timetable', detail: course.name, source: 'demo' }
  }

  const days = Array.from(new Set(mine.map((session) => weekdayShort[session.day])))
  const times = Array.from(new Set(mine.map((session) => formatTime(session.startTime))))

  return {
    kind: 'timetable',
    label: 'Your timetable',
    detail: `${course.short} · ${days.join(', ')} at ${times.join(' / ')}`,
    source: 'demo',
  }
}

/* ---------------------------------------------------------------- answers */

function answerSkip(
  course: Course | null,
  summary: AttendanceSummary,
  sessions: ClassSession[],
): Omit<ChatMessage, 'id' | 'role'> {
  const nextUp = findNextSession(sessions)
  const target = course ?? (nextUp ? (courseById.get(nextUp.session.courseId) ?? null) : null)

  if (!target) {
    return {
      content:
        'I could not tell which class you mean. Ask me about a specific course — for example “can I skip DBMS tomorrow?”',
      sources: [timetableSource(null)],
    }
  }

  const row = summary.courses.find((entry) => entry.courseId === target.id)
  if (!row) {
    return {
      content: `I do not have an attendance record for ${target.name} yet.`,
      sources: [attendanceSource(target, summary)],
    }
  }

  const required = row.requiredPercentage
  const current = percentage(row.attended, row.held)
  const afterSkipping = percentage(row.attended, row.held + 1)
  const data: AssistantDataPoint[] = [
    {
      label: 'Current',
      value: `${ROUND(current)}%`,
      tone: current < required ? 'danger' : 'neutral',
    },
    {
      label: 'If you skip',
      value: `${ROUND(afterSkipping)}%`,
      tone: afterSkipping < required ? 'danger' : 'ok',
    },
    { label: 'Required', value: `${required}%`, tone: 'neutral' },
  ]

  const sources = [
    attendanceSource(target, summary),
    courseScheduleSource(target, sessions),
    requirementSource,
  ]

  const actions = [
    { label: 'View attendance', to: '/app/attendance' },
    { label: 'Open timetable', to: '/app/timetable' },
  ]

  if (current < required) {
    const recover = classesMustAttend(row.attended, row.held, required)
    data.push({ label: 'To recover', value: `${recover} classes`, tone: 'warn' })
    return {
      content: `I wouldn’t recommend skipping it. You’re at ${ROUND(current)}% in ${target.name}, already below the ${required}% requirement. Missing another class takes you to ${ROUND(afterSkipping)}%. Attending the next ${recover} ${target.short} classes in a row would bring you back to ${required}%.`,
      data,
      sources,
      actions,
    }
  }

  if (afterSkipping < required) {
    return {
      content: `I’d go. You’re at ${ROUND(current)}% in ${target.name}, which is above the ${required}% requirement — but only just. Skipping this one drops you to ${ROUND(afterSkipping)}%, below the line.`,
      data,
      sources,
      actions,
    }
  }

  const remaining = classesCanMiss(row.attended, row.held + 1, required)
  data.push({ label: 'Still spare', value: `${remaining} classes`, tone: 'ok' })
  return {
    content: `You can. You’re at ${ROUND(current)}% in ${target.name}, and skipping one class leaves you at ${ROUND(afterSkipping)}% — still above the ${required}% requirement, with ${remaining} more you could miss after that.`,
    data,
    sources,
    actions,
  }
}

function answerAttendance(
  course: Course | null,
  summary: AttendanceSummary,
): Omit<ChatMessage, 'id' | 'role'> {
  if (course) {
    const row = summary.courses.find((entry) => entry.courseId === course.id)
    if (!row) {
      return {
        content: `I do not have an attendance record for ${course.name} yet.`,
        sources: [attendanceSource(course, summary)],
      }
    }
    const pct = ROUND(percentage(row.attended, row.held))
    const below = pct < row.requiredPercentage
    return {
      content: below
        ? `You’re at ${pct}% in ${course.name} — ${row.requiredPercentage - pct} points below the ${row.requiredPercentage}% requirement. Attending the next ${row.mustAttend} classes would bring you back.`
        : `You’re at ${pct}% in ${course.name}, above the ${row.requiredPercentage}% requirement. You could miss ${row.canMiss} more ${course.short} ${row.canMiss === 1 ? 'class' : 'classes'} and stay above it.`,
      data: [
        { label: 'Current', value: `${pct}%`, tone: below ? 'danger' : 'ok' },
        { label: 'Attended', value: `${row.attended} of ${row.held}` },
        { label: 'Required', value: `${row.requiredPercentage}%` },
      ],
      sources: [attendanceSource(course, summary), requirementSource],
      actions: [{ label: 'View attendance', to: '/app/attendance' }],
    }
  }

  const overall = ROUND(summary.overallPercentage)
  const belowCourses = summary.courses.filter((row) => row.status === 'below')
  const atRisk = summary.courses.filter((row) => row.status === 'at-risk')

  const trouble = [...belowCourses, ...atRisk]
    .map((row) => `${courseById.get(row.courseId)?.short ?? 'Course'} ${ROUND(percentage(row.attended, row.held))}%`)
    .join(', ')

  return {
    content:
      belowCourses.length > 0
        ? `Overall you’re at ${overall}%, but ${belowCourses.length === 1 ? 'one course is' : `${belowCourses.length} courses are`} below the ${summary.requiredPercentage}% requirement. Watch these: ${trouble}.`
        : `Overall you’re at ${overall}%, above the ${summary.requiredPercentage}% requirement.${atRisk.length > 0 ? ` Keep an eye on ${trouble} — ${atRisk.length === 1 ? 'it is' : 'they are'} close to the line.` : ''}`,
    data: [
      {
        label: 'Overall',
        value: `${overall}%`,
        tone: overall < summary.requiredPercentage ? 'danger' : 'ok',
      },
      { label: 'Attended', value: `${summary.totalAttended} of ${summary.totalHeld}` },
      { label: 'Required', value: `${summary.requiredPercentage}%` },
    ],
    sources: [attendanceSource(null, summary), requirementSource],
    actions: [{ label: 'View attendance', to: '/app/attendance' }],
  }
}

function answerNextClass(sessions: ClassSession[]): Omit<ChatMessage, 'id' | 'role'> {
  const next = findNextSession(sessions)
  if (!next) {
    return {
      content: 'There is nothing left on your timetable this week.',
      sources: [timetableSource(null)],
    }
  }

  const course = courseById.get(next.session.courseId)
  const today = sessionsForDay(sessions, next.day)

  return {
    content: `${next.isToday ? 'Next up today' : `Next up on ${weekdayLabel[next.day]}`}: ${course?.name ?? 'Class'} at ${formatTime(next.session.startTime)} in ${next.session.block} · ${next.session.room}, with ${next.session.faculty}.${next.isToday ? ` You have ${today.length} ${today.length === 1 ? 'class' : 'classes'} scheduled today.` : ''}`,
    data: [
      { label: 'Starts', value: formatTime(next.session.startTime) },
      { label: 'Where', value: `${next.session.block} · ${next.session.room}` },
      { label: 'Type', value: next.session.kind === 'lab' ? 'Lab' : 'Lecture' },
    ],
    sources: [timetableSource(next.session)],
    actions: [{ label: 'Open timetable', to: '/app/timetable' }],
  }
}

function answerComplaints(complaints: Complaint[]): Omit<ChatMessage, 'id' | 'role'> {
  const open = complaints.filter((complaint) => complaint.stage !== 'resolved')

  if (open.length === 0) {
    return {
      content: 'You have no open requests right now.',
      sources: [
        { kind: 'complaints', label: 'Your requests', detail: 'No open requests', source: 'demo' },
      ],
      actions: [{ label: 'Report an issue', to: '/app/complaints/new' }],
    }
  }

  const latest = open[0]
  const lastEntry = latest.timeline[latest.timeline.length - 1]

  return {
    content: `You have ${open.length} open ${open.length === 1 ? 'request' : 'requests'}. The most recent update is on ${latest.reference} — ${latest.title.toLowerCase()}: ${lastEntry.description}`,
    data: [
      { label: 'Reference', value: latest.reference },
      {
        label: 'Status',
        value: stageLabel[latest.stage],
        tone: latest.stage === 'verification' ? 'warn' : 'neutral',
      },
      { label: 'Where', value: `${latest.block} · ${latest.room}` },
    ],
    sources: [
      {
        kind: 'complaints',
        label: 'Your requests',
        detail: `${open.length} open, filed by you`,
        source: 'demo',
      },
    ],
    actions: [
      { label: 'Track this request', to: `/app/complaints/${latest.id}` },
      { label: 'All requests', to: '/app/complaints' },
    ],
  }
}

function answerEvents(events: CampusEvent[]): Omit<ChatMessage, 'id' | 'role'> {
  const upcoming = events.slice(0, 3)
  if (upcoming.length === 0) {
    return {
      content: 'Nothing is scheduled on campus in the next few days.',
      sources: [{ kind: 'policy', label: 'Campus events', detail: 'Demo listing', source: 'demo' }],
    }
  }

  return {
    content: `Three things coming up: ${upcoming
      .map((event) => `${event.title} (${event.venue})`)
      .join(', ')}.`,
    data: upcoming.map((event) => ({
      label: event.title,
      value: `${formatTime(event.startTime)}`,
    })),
    sources: [
      { kind: 'policy', label: 'Campus events', detail: 'Demo event listing', source: 'demo' },
    ],
    actions: [{ label: 'Browse events', to: '/app/events' }],
  }
}

function answerDeadlines(
  deadlines: Deadline[],
  at: Date,
): Omit<ChatMessage, 'id' | 'role'> {
  const pending = deadlines
    .filter((deadline) => !deadline.submitted)
    .sort((a, b) => `${a.date}${a.dueTime}`.localeCompare(`${b.date}${b.dueTime}`))

  if (pending.length === 0) {
    return {
      content: 'Nothing is outstanding — every piece of coursework is submitted.',
      sources: [
        { kind: 'policy', label: 'Your coursework', detail: 'Nothing pending', source: 'demo' },
      ],
    }
  }

  const today = toLocalIsoDate(at)
  const next = pending[0]
  const course = courseById.get(next.courseId)
  const dueToday = next.date === today

  return {
    content: `You have ${pending.length} ${pending.length === 1 ? 'item' : 'items'} outstanding. The next is ${next.title} for ${course?.short ?? 'a course'}, due ${dueToday ? `today at ${formatTime(next.dueTime)}` : formatDateLabel(next.date).toLowerCase()}.`,
    data: pending.slice(0, 4).map((deadline) => ({
      label: courseById.get(deadline.courseId)?.short ?? 'Course',
      value: formatDateLabel(deadline.date),
      tone: deadline.date === today ? ('danger' as const) : ('neutral' as const),
    })),
    sources: [
      {
        kind: 'policy',
        label: 'Your coursework',
        detail: `${pending.length} pending across your courses`,
        source: 'demo',
      },
    ],
    actions: [{ label: 'Open timetable', to: '/app/timetable' }],
  }
}

function answerDay(
  sessions: ClassSession[],
  deadlines: Deadline[],
  at: Date,
): Omit<ChatMessage, 'id' | 'role'> {
  const today = weekdayFromDate(at)
  const todaySessions = today ? sessionsForDay(sessions, today) : []
  const isoToday = toLocalIsoDate(at)
  const dueToday = deadlines.filter(
    (deadline) => deadline.date === isoToday && !deadline.submitted,
  )

  const next = findNextSession(sessions, at)
  const remaining = todaySessions.filter((session) => session.status !== 'completed').length

  const parts: string[] = []
  parts.push(
    todaySessions.length === 0
      ? 'You have no classes today'
      : `You have ${todaySessions.length} ${todaySessions.length === 1 ? 'class' : 'classes'} today${remaining !== todaySessions.length ? `, ${remaining} still to come` : ''}`,
  )
  if (dueToday.length > 0) {
    parts.push(
      `${dueToday.length} ${dueToday.length === 1 ? 'deadline is' : 'deadlines are'} due today`,
    )
  }
  if (next?.isToday) {
    const course = courseById.get(next.session.courseId)
    parts.push(
      `next up is ${course?.short ?? 'a class'} at ${formatTime(next.session.startTime)} in ${next.session.block} · ${next.session.room}`,
    )
  }

  return {
    content: `${parts.join(', and ')}.`,
    data: [
      { label: 'Classes', value: String(todaySessions.length) },
      {
        label: 'Due today',
        value: String(dueToday.length),
        tone: dueToday.length > 0 ? 'warn' : 'neutral',
      },
      ...(next?.isToday ? [{ label: 'Next', value: formatTime(next.session.startTime) }] : []),
    ],
    sources: [timetableSource(next?.session ?? null)],
    actions: [{ label: 'Open Today', to: '/app' }],
  }
}

function answerUnknown(): Omit<ChatMessage, 'id' | 'role'> {
  return {
    content:
      'I can answer questions about your attendance, your timetable, your coursework deadlines, the requests you have filed, and what is happening on campus. Try asking whether you can skip a specific class.',
  }
}

/* -------------------------------------------------------------------- ask */

export async function ask(question: string): Promise<ChatMessage> {
  const text = question.toLowerCase().replace(/[’']/g, "'")
  const intent = detectIntent(text)
  const course = detectCourse(text)

  let body: Omit<ChatMessage, 'id' | 'role'>

  switch (intent) {
    case 'skip': {
      const [summary, sessions] = await Promise.all([getAttendance(), listSessions()])
      body = answerSkip(course, summary, sessions)
      break
    }
    case 'attendance': {
      body = answerAttendance(course, await getAttendance())
      break
    }
    case 'next-class': {
      body = answerNextClass(await listSessions())
      break
    }
    case 'complaints': {
      body = answerComplaints(await listComplaints())
      break
    }
    case 'events': {
      body = answerEvents(await listEvents())
      break
    }
    case 'deadlines': {
      body = answerDeadlines(await listDeadlines(), new Date())
      break
    }
    case 'day': {
      const [sessions, deadlines] = await Promise.all([listSessions(), listDeadlines()])
      body = answerDay(sessions, deadlines, new Date())
      break
    }
    default:
      body = answerUnknown()
  }

  return { id: uid('msg'), role: 'assistant', ...body }
}

/** Count used on the dashboard entry point. Demo-only signal. */
export async function answeredCount() {
  const items = await listNotifications()
  return items.length
}
