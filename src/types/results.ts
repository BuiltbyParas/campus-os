import type { DataSource, Id } from '@/types'

export type Grade = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F'

export interface SubjectResult {
  courseId: Id
  courseName: string
  courseCode: string
  credits: number
  internal: number       // out of 40
  midSem: number         // out of 30
  endSem: number         // out of 30
  total: number          // out of 100
  grade: Grade
  gradePoint: number     // 10-point scale
  sectionAverage: number // anonymized section avg total
}

export interface SemesterResult {
  semester: number
  sgpa: number
  totalCredits: number
  earnedCredits: number
  subjects: SubjectResult[]
  source: DataSource
  declaredAt: string     // ISO date
}

export interface ResultsSummary {
  currentSemester: SemesterResult
  cgpa: number
  sgpaHistory: { semester: number; sgpa: number }[]
  source: DataSource
}
