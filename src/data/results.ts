import type { Grade, ResultsSummary } from '@/types/results'
import { hoursAgo } from './_time'

export const gradeLabel: Record<Grade, string> = {
  'O': 'Outstanding',
  'A+': 'Excellent',
  'A': 'Very Good',
  'B+': 'Good',
  'B': 'Above Average',
  'C': 'Average',
  'P': 'Pass',
  'F': 'Fail'
}

export const gradeColor: Record<Grade, string> = {
  'O': 'ok',
  'A+': 'ok',
  'A': 'ok',
  'B+': 'info',
  'B': 'info',
  'C': 'warn',
  'P': 'warn',
  'F': 'danger'
}

export const resultsSummary: ResultsSummary = {
  currentSemester: {
    semester: 2,
    sgpa: 8.2,
    totalCredits: 18,
    earnedCredits: 18,
    subjects: [
      {
        courseId: 'crs_dbms',
        courseName: 'Database Management Systems',
        courseCode: 'BCA-204',
        credits: 4,
        internal: 28,
        midSem: 18,
        endSem: 22,
        total: 68,
        grade: 'B+',
        gradePoint: 7,
        sectionAverage: 62
      },
      {
        courseId: 'crs_cn',
        courseName: 'Computer Networks',
        courseCode: 'BCA-206',
        credits: 4,
        internal: 35,
        midSem: 24,
        endSem: 26,
        total: 85,
        grade: 'A',
        gradePoint: 9,
        sectionAverage: 71
      },
      {
        courseId: 'crs_c',
        courseName: 'Programming in C',
        courseCode: 'BCA-202',
        credits: 4,
        internal: 32,
        midSem: 22,
        endSem: 24,
        total: 78,
        grade: 'A',
        gradePoint: 8,
        sectionAverage: 65
      },
      {
        courseId: 'crs_math',
        courseName: 'Mathematics',
        courseCode: 'BCA-201',
        credits: 3,
        internal: 26,
        midSem: 16,
        endSem: 20,
        total: 62,
        grade: 'B',
        gradePoint: 7,
        sectionAverage: 58
      },
      {
        courseId: 'crs_web',
        courseName: 'Web Development',
        courseCode: 'BCA-208',
        credits: 3,
        internal: 36,
        midSem: 26,
        endSem: 28,
        total: 90,
        grade: 'O',
        gradePoint: 10,
        sectionAverage: 74
      }
    ],
    source: 'demo',
    declaredAt: hoursAgo(48)
  },
  cgpa: 7.7,
  sgpaHistory: [
    { semester: 1, sgpa: 7.2 },
    { semester: 2, sgpa: 8.2 }
  ],
  source: 'demo'
}
