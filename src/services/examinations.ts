import { examSchedule } from '@/data/examinations'
import type { ExamSchedule } from '@/types/examinations'
import { request } from './http'

export function getExamSchedule(): Promise<ExamSchedule> {
  return request('/exams', () => examSchedule)
}

export function daysUntilExam(examDate: string): number {
  const now = new Date()
  const exam = new Date(examDate + 'T00:00:00')
  return Math.max(0, Math.ceil((exam.getTime() - now.getTime()) / 86_400_000))
}
