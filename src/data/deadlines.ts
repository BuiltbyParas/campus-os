import type { Deadline, DeadlineKind } from '@/types'

import { dayOffset } from './_time'

export const deadlineKindLabel: Record<DeadlineKind, string> = {
  assignment: 'Assignment',
  quiz: 'Quiz',
  submission: 'Submission',
  exam: 'Exam',
}

/**
 * Coursework due dates for the demo student.
 *
 * Dated relative to whenever the app is opened so the Today view always has a
 * live deadline to reason about. Fictional — nothing here reflects a real
 * institution's coursework.
 */
export const deadlines: Deadline[] = [
  {
    id: 'dln_1',
    courseId: 'crs_dbms',
    title: 'ER diagram & normalisation worksheet',
    kind: 'assignment',
    date: dayOffset(0),
    dueTime: '13:30',
    submitted: false,
  },
  {
    id: 'dln_2',
    courseId: 'crs_c',
    title: 'Pointers lab record',
    kind: 'submission',
    date: dayOffset(1),
    dueTime: '17:00',
    submitted: false,
  },
  {
    id: 'dln_3',
    courseId: 'crs_cn',
    title: 'Unit 2 quiz',
    kind: 'quiz',
    date: dayOffset(3),
    dueTime: '11:00',
    submitted: false,
  },
  {
    id: 'dln_4',
    courseId: 'crs_web',
    title: 'Portfolio site checkpoint',
    kind: 'assignment',
    date: dayOffset(6),
    dueTime: '23:59',
    submitted: false,
  },
  {
    id: 'dln_5',
    courseId: 'crs_math',
    title: 'Problem set 4',
    kind: 'assignment',
    date: dayOffset(-2),
    dueTime: '17:00',
    submitted: true,
  },
]
