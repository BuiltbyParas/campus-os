import type { DataSource, Id } from '@/types'

export type ExamType = 'mid-sem' | 'end-sem' | 'practical' | 'viva'

export interface Examination {
  id: Id
  courseId: Id
  courseName: string
  courseCode: string
  type: ExamType
  /** ISO date e.g. '2026-09-28' */
  date: string
  /** 24h time e.g. '10:00' */
  startTime: string
  /** Duration in minutes */
  duration: number
  venue: string
  seatNumber: string
  /** Syllabus units covered, e.g. ['Unit 1', 'Unit 2', 'Unit 3'] */
  syllabus: string[]
  /** Reporting time before exam e.g. '09:30' */
  reportingTime: string
}

export interface ExamSchedule {
  examType: ExamType
  exams: Examination[]
  source: DataSource
}
