import { buildExamSchedule } from '@/lib/exams'
import type { Exam } from '@/types'

import { dayOffset, hoursAgo } from './_time'

/**
 * End-semester examinations for the demo student.
 *
 * **Fictional.** These dates, rooms, seat numbers and instructions are invented
 * for the prototype. They are not any institution's real examination schedule
 * or seating plan, and the UI labels the whole record as demo data.
 *
 * Seating is published for the two nearest papers and pending for the rest,
 * which is how it actually arrives — and it gives the interface a genuine
 * "not released yet" state to render honestly rather than a blank cell.
 */
const exams: Exam[] = [
  {
    id: 'exm_dbms',
    courseId: 'crs_dbms',
    kind: 'end-term',
    date: dayOffset(6),
    startTime: '10:00',
    endTime: '13:00',
    note: 'Closed book. Non-programmable calculator permitted.',
    seat: {
      block: 'Block 34',
      room: 'Room 204',
      seat: 'B-12',
      note: 'Row 3, second desk from the window',
      publishedAt: hoursAgo(18),
    },
  },
  {
    id: 'exm_cn',
    courseId: 'crs_cn',
    kind: 'end-term',
    date: dayOffset(8),
    startTime: '10:00',
    endTime: '13:00',
    note: 'Closed book.',
    seat: {
      block: 'Block 34',
      room: 'Room 207',
      seat: 'A-04',
      note: 'Front row, nearest the door',
      publishedAt: hoursAgo(18),
    },
  },
  {
    id: 'exm_c',
    courseId: 'crs_c',
    kind: 'end-term',
    date: dayOffset(11),
    startTime: '14:00',
    endTime: '17:00',
    note: 'Closed book.',
  },
  {
    id: 'exm_math',
    courseId: 'crs_math',
    kind: 'end-term',
    date: dayOffset(13),
    startTime: '10:00',
    endTime: '13:00',
    note: 'Formula sheet provided with the question paper.',
  },
  {
    id: 'exm_web',
    courseId: 'crs_web',
    kind: 'practical',
    date: dayOffset(15),
    startTime: '09:00',
    endTime: '12:00',
    note: 'Lab machines allocated on arrival. Bring your campus ID.',
  },
]

export const examSchedule = buildExamSchedule(exams)
