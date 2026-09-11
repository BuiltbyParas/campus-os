import type { DataSource, Id } from '@/types'
import { dayOffset } from './_time'

export interface ReEvalSubject {
  courseId: Id
  courseName: string
  courseCode: string
  currentGrade: string
  currentTotal: number
  maxMarks: number
  reEvalFee: number
  historicalSuccessRate: number  // e.g. 0.23 = 23%
}

export interface ReEvalStatus {
  eligible: ReEvalSubject[]
  deadline: string  // ISO date for re-eval application
  feePerSubject: number
  source: DataSource
}

export const reEvalStatus: ReEvalStatus = {
  eligible: [
    {
      courseId: 'crs_dbms',
      courseName: 'Database Management Systems',
      courseCode: 'BCA-204',
      currentGrade: 'B',
      currentTotal: 68,
      maxMarks: 100,
      reEvalFee: 500,
      historicalSuccessRate: 0.23,
    },
    {
      courseId: 'crs_math',
      courseName: 'Discrete Mathematics',
      courseCode: 'BCA-201',
      currentGrade: 'C',
      currentTotal: 62,
      maxMarks: 100,
      reEvalFee: 500,
      historicalSuccessRate: 0.18,
    }
  ],
  deadline: dayOffset(10),
  feePerSubject: 500,
  source: 'demo'
}
