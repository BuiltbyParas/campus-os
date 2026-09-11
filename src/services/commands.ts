import { courseById, courses, deadlineKindLabel, stageShortLabel, weekdayShort } from '@/data'
import { countdown, toMinutes } from '@/lib/agenda'
import { examKindLabel } from '@/lib/exams'
import { formatMoney } from '@/lib/fees'
import { daysUntil, formatDateLabel, formatTime, matches } from '@/lib/utils'
import type {
  AttendanceSummary,
  ClassSession,
  CommandItem,
  Complaint,
  Deadline,
  EduProgress,
  ExamSchedule,
  FeeSummary,
  ResultsSummary,
} from '@/types'

import { findNextSession } from './academics'

/**
 * The command palette's index.
 *
 * This is what makes ⌘K a command center rather than a search box: the index
 * mixes *navigation*, *actions* and *live answers*. Typing "DBMS" should not
 * return a link to a page about DBMS — it should return the attendance figure,
 * the next class time, and a way to ask about it.
 *
 * Everything is derived from the same records the rest of the app renders, so a
 * figure shown here can never disagree with the screen behind it.
 */

const STANDING_COMMANDS: CommandItem[] = [
  {
    id: 'cmd_report',
    kind: 'action',
    title: 'Report an issue',
    subtitle: 'Hostel, lab or facility problem',
    keywords: ['complaint', 'broken', 'ac', 'wifi', 'maintenance', 'new'],
    to: '/app/complaints/new',
  },
  {
    id: 'cmd_assistant',
    kind: 'assistant',
    title: 'Ask CampusOS',
    subtitle: 'Answers from your own records',
    keywords: ['ai', 'assistant', 'question', 'help', 'chat'],
    to: '/app/assistant',
  },
  {
    id: 'cmd_dashboard',
    kind: 'navigation',
    title: 'Today',
    keywords: ['dashboard', 'home', 'overview'],
    to: '/app',
  },
  {
    id: 'cmd_attendance',
    kind: 'navigation',
    title: 'Attendance',
    keywords: ['percentage', 'shortage', 'classes'],
    to: '/app/attendance',
  },
  {
    id: 'cmd_academics',
    kind: 'navigation',
    title: 'Academics',
    subtitle: 'Marks, re-evaluation and EDU-Revolution',
    keywords: ['results', 'marks', 'ca', 'grades', 'score', 'revaluation', 're-evaluation', 'edu'],
    to: '/app/academics',
  },
  {
    id: 'cmd_exams',
    kind: 'navigation',
    title: 'Examinations',
    subtitle: 'Schedule and seating plan',
    keywords: ['exam', 'exams', 'seat', 'seating', 'paper', 'end-term', 'datesheet', 'hall'],
    to: '/app/exams',
  },
  {
    id: 'cmd_fees',
    kind: 'navigation',
    title: 'Fees',
    subtitle: 'Balance, breakdown and payment history',
    keywords: ['fee', 'payment', 'due', 'money', 'instalment', 'scholarship', 'pay'],
    to: '/app/fees',
  },
  {
    id: 'cmd_timetable',
    kind: 'navigation',
    title: 'Timetable',
    keywords: ['schedule', 'classes', 'week'],
    to: '/app/timetable',
  },
  {
    id: 'cmd_complaints',
    kind: 'navigation',
    title: 'Complaints',
    keywords: ['requests', 'track', 'issues'],
    to: '/app/complaints',
  },
  { id: 'cmd_events', kind: 'navigation', title: 'Events', keywords: ['workshop', 'fest'], to: '/app/events' },
  { id: 'cmd_profile', kind: 'navigation', title: 'Profile', keywords: ['account', 'me'], to: '/app/profile' },
  {
    id: 'cmd_settings',
    kind: 'navigation',
    title: 'Settings',
    keywords: ['preferences', 'theme', 'notifications'],
    to: '/app/settings',
  },
]

export function buildCommandIndex({
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
}): CommandItem[] {
  const items: CommandItem[] = [...STANDING_COMMANDS]

  /* ------------------------------------------------- live course answers */
  for (const course of courses) {
    const row = attendance?.courses.find((entry) => entry.courseId === course.id)
    const aliases = [course.short, course.code, course.name]

    if (row) {
      items.push({
        id: `cmd_att_${course.id}`,
        kind: 'info',
        title: `${course.short} attendance`,
        subtitle: `${row.attended} of ${row.held} classes · ${course.name}`,
        keywords: [...aliases, 'attendance', 'percentage'],
        to: '/app/attendance',
        badge: `${Math.round(row.percentage)}%`,
        badgeTone: row.status === 'below' ? 'danger' : row.status === 'at-risk' ? 'warn' : 'ok',
      })
    }

    const result = results?.courses.find((entry) => entry.courseId === course.id)
    if (result) {
      items.push({
        id: `cmd_res_${course.id}`,
        kind: 'info',
        title: `${course.short} marks`,
        subtitle: `${Math.round(result.assessed)}% of the course assessed · ${course.name}`,
        keywords: [...aliases, 'result', 'marks', 'ca', 'score', 'grade'],
        to: '/app/academics',
        badge: `${Math.round(result.percentage)}%`,
        badgeTone: result.percentage < 50 ? 'danger' : result.percentage < 65 ? 'warn' : 'ok',
      })
    }

    const exam = exams?.exams.find((entry) => entry.courseId === course.id)
    if (exam) {
      const days = daysUntil(exam.date, at)
      items.push({
        id: `cmd_exam_${course.id}`,
        kind: 'info',
        title: `${course.short} ${examKindLabel[exam.kind].toLowerCase()}`,
        subtitle: exam.seat
          ? `${formatDateLabel(exam.date)} · ${exam.seat.block} · ${exam.seat.room} · Seat ${exam.seat.seat}`
          : `${formatDateLabel(exam.date)} · seat not released yet`,
        keywords: [...aliases, 'exam', 'seat', 'seating', 'paper', 'hall'],
        to: '/app/exams',
        badge: days < 0 ? 'Done' : days === 0 ? 'Today' : `${days}d`,
        badgeTone: days <= 1 && days >= 0 ? 'danger' : days <= 7 ? 'warn' : 'info',
      })
    }

    /* The next occurrence of this specific course, with a real countdown. */
    const upcoming = findNextSession(
      sessions.filter((session) => session.courseId === course.id),
      at,
    )
    if (upcoming) {
      const untilStart =
        toMinutes(upcoming.session.startTime) - (at.getHours() * 60 + at.getMinutes())
      items.push({
        id: `cmd_next_${course.id}`,
        kind: 'info',
        title: `Next ${course.short}`,
        subtitle: `${formatTime(upcoming.session.startTime)} · ${upcoming.session.block} · ${upcoming.session.room}`,
        keywords: [...aliases, 'next', 'class', 'when', 'where'],
        to: '/app/timetable',
        badge: upcoming.isToday ? countdown(untilStart) : weekdayShort[upcoming.day],
      })
    }

    items.push({
      id: `cmd_ask_${course.id}`,
      kind: 'assistant',
      title: `Ask CampusOS about ${course.short}`,
      subtitle: 'Attendance, schedule and whether you can skip',
      keywords: [...aliases, 'ask', 'skip', 'question'],
      to: `/app/assistant?q=${encodeURIComponent(`How is my ${course.short} attendance?`)}`,
    })
  }

  /* -------------------------------------------------------- examinations */
  if (exams?.next) {
    const next = exams.next
    const days = daysUntil(next.date, at)
    const course = courseById.get(next.courseId)

    items.push({
      id: 'cmd_exam_next',
      kind: 'info',
      title: 'Next examination',
      subtitle: `${course?.short ?? 'Exam'} · ${formatDateLabel(next.date)} · ${formatTime(next.startTime)}`,
      keywords: ['exam', 'exams', 'next', 'paper', 'datesheet', 'schedule'],
      to: '/app/exams',
      badge: days === 0 ? 'Today' : `${days}d`,
      badgeTone: days <= 1 ? 'danger' : days <= 7 ? 'warn' : 'info',
    })

    if (next.seat) {
      items.push({
        id: 'cmd_exam_seat',
        kind: 'info',
        title: 'Your exam seat',
        subtitle: `${next.seat.block} · ${next.seat.room}${next.seat.note ? ` · ${next.seat.note}` : ''}`,
        keywords: ['seat', 'seating', 'plan', 'where', 'room', 'block', 'hall', 'exam'],
        to: '/app/exams',
        badge: next.seat.seat,
      })
    }
  }

  /* ------------------------------------------------------------- finance */
  if (fees) {
    const next = fees.nextDue
    if (next) {
      const days = daysUntil(next.dueDate, at)
      items.push({
        id: 'cmd_fee_next',
        kind: 'info',
        title: 'Upcoming payment',
        subtitle: `${next.label} · ${days < 0 ? 'overdue' : `due in ${days} ${days === 1 ? 'day' : 'days'}`}`,
        keywords: ['fee', 'fees', 'payment', 'due', 'pay', 'instalment', 'money'],
        to: '/app/fees',
        badge: formatMoney(next.amount, fees.currency),
        badgeTone: days < 0 ? 'danger' : days <= 7 ? 'warn' : 'info',
      })
    }

    items.push({
      id: 'cmd_fee_breakdown',
      kind: 'info',
      title: 'Fee breakdown',
      subtitle: `${fees.breakdown.length} lines · tuition, hostel and more`,
      keywords: ['fee', 'fees', 'breakdown', 'structure', 'tuition', 'hostel', 'mess'],
      to: '/app/fees',
      badge: formatMoney(fees.totalPayable, fees.currency),
    })

    items.push({
      id: 'cmd_fee_history',
      kind: 'info',
      title: 'Payment history',
      subtitle: `${fees.instalments.filter((entry) => entry.status === 'paid').length} payments recorded`,
      keywords: ['fee', 'fees', 'payment', 'history', 'paid', 'receipt', 'transaction'],
      to: '/app/fees',
      badge: formatMoney(fees.totalPaid, fees.currency),
      badgeTone: 'ok',
    })

    items.push({
      id: 'cmd_fee_ask',
      kind: 'assistant',
      title: 'Ask CampusOS about fees',
      subtitle: 'What is due, and when',
      keywords: ['fee', 'fees', 'payment', 'ask'],
      to: `/app/assistant?q=${encodeURIComponent('When is my next fee payment due?')}`,
    })
  }

  /* ------------------------------------------------------ EDU-Revolution */
  if (edu) {
    items.push({
      id: 'cmd_edu',
      kind: 'info',
      title: 'EDU-Revolution progress',
      subtitle: edu.nextRecommended
        ? `Next: ${edu.nextRecommended.title}`
        : 'All activities complete',
      keywords: ['edu', 'revolution', 'co-curricular', 'activity', 'activities', 'progress'],
      to: '/app/academics',
      badge: `${edu.completed}/${edu.required}`,
      badgeTone: edu.completed >= edu.required ? 'ok' : 'info',
    })
  }

  /* --------------------------------------------------------- overall marks */
  if (results) {
    items.push({
      id: 'cmd_results_overall',
      kind: 'info',
      title: 'Results',
      subtitle: 'Weighted average across assessed work',
      keywords: ['result', 'results', 'marks', 'ca', 'grade', 'average', 'score'],
      to: '/app/academics',
      badge: `${Math.round(results.overallPercentage)}%`,
    })
  }

  /* ----------------------------------------------------- open complaints */
  for (const complaint of complaints) {
    if (complaint.stage === 'resolved') continue
    items.push({
      id: `cmd_cmp_${complaint.id}`,
      kind: 'info',
      title: complaint.title,
      subtitle: `${complaint.reference} · ${complaint.block} · ${complaint.room}`,
      keywords: ['complaint', 'request', 'track', complaint.reference, complaint.category],
      to: `/app/complaints/${complaint.id}`,
      badge: stageShortLabel[complaint.stage],
      badgeTone: complaint.stage === 'verification' ? 'warn' : 'info',
    })
  }

  /* ------------------------------------------------------ open deadlines */
  for (const deadline of deadlines) {
    if (deadline.submitted) continue
    const course = courseById.get(deadline.courseId)
    items.push({
      id: `cmd_dln_${deadline.id}`,
      kind: 'info',
      title: deadline.title,
      subtitle: `${deadlineKindLabel[deadline.kind]} · ${course?.short ?? ''} · due ${formatTime(deadline.dueTime)}`,
      keywords: ['deadline', 'due', 'assignment', 'coursework', course?.short ?? '', course?.name ?? ''],
      to: '/app/timetable',
    })
  }

  return items
}

/**
 * Natural-language shortcuts.
 *
 * A command centre that only matches nouns forces the student to already know
 * the app's vocabulary. These map the handful of phrasings people actually type
 * onto the assistant, which can answer them from real records — so a question
 * typed into the palette is never a dead end.
 */
const QUESTION_PATTERNS: { test: RegExp; title: string; question: string }[] = [
  {
    test: /\b(tomorrow|next day)\b/,
    title: 'What do I have tomorrow?',
    question: 'What does my day look like tomorrow?',
  },
  {
    test: /\b(today|right now|now)\b/,
    title: 'What does my day look like?',
    question: 'What does my day look like?',
  },
  {
    test: /\b(skip|miss|bunk)\b/,
    title: 'Can I skip a class?',
    question: 'Can I skip my next class?',
  },
  {
    test: /\b(due|deadline|submit|assignment)\b/,
    title: 'What coursework is due?',
    question: 'What coursework is due?',
  },
  {
    test: /\b(attendance|percentage|short)\b/,
    title: 'How is my attendance?',
    question: 'How is my attendance looking?',
  },
  {
    test: /\b(fee|fees|pay|payment|due|owe|money)\b/,
    title: 'When is my next fee payment due?',
    question: 'When is my next fee payment due?',
  },
  {
    test: /\b(marks|result|results|ca|grade|score)\b/,
    title: 'How are my marks?',
    question: 'How are my marks so far?',
  },
  {
    test: /\b(exam|exams|seat|seating|paper|datesheet)\b/,
    title: 'When is my next exam?',
    question: 'When is my next exam and where do I sit?',
  },
]

function questionCommands(query: string): CommandItem[] {
  const text = query.toLowerCase()
  return QUESTION_PATTERNS.filter((pattern) => pattern.test.test(text)).map((pattern) => ({
    id: `cmd_q_${pattern.title}`,
    kind: 'assistant' as const,
    title: pattern.title,
    subtitle: 'Answered from your records',
    to: `/app/assistant?q=${encodeURIComponent(pattern.question)}`,
  }))
}

/**
 * Ranks the index against a query.
 *
 * A title match always outranks a keyword match, so typing "attendance" leads
 * with the page rather than with a course that merely mentions the word.
 */
export function searchCommands(items: CommandItem[], query: string): CommandItem[] {
  const trimmed = query.trim()
  if (!trimmed) {
    // The resting state shows what you can *do*, not the whole index.
    return items.filter((item) => item.kind === 'action' || item.kind === 'navigation').slice(0, 7)
  }

  /* A recognised question outranks everything: someone who typed a sentence
     wants an answer, not a page. */
  const questions = questionCommands(trimmed)

  const scored = items
    .map((item) => {
      const title = item.title.toLowerCase()
      const needle = trimmed.toLowerCase()

      let score = 0
      if (title === needle) score = 100
      else if (title.startsWith(needle)) score = 80
      else if (matches(item.title, trimmed)) score = 60
      else if (item.subtitle && matches(item.subtitle, trimmed)) score = 30
      else if (item.keywords?.some((keyword) => matches(keyword, trimmed))) score = 40

      // Live answers are more useful than a page link when both match.
      if (score > 0 && item.kind === 'info') score += 5

      return { item, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  const matched = scored.map((entry) => entry.item)
  const seen = new Set(questions.map((item) => item.id))

  return [...questions, ...matched.filter((item) => !seen.has(item.id))].slice(0, 10)
}
