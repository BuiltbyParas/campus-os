import type { Course } from '@/types'

/** Semester 2 course list for the demo student. Fictional. */
export const courses: Course[] = [
  {
    id: 'crs_dbms',
    code: 'BCA-204',
    name: 'Database Management Systems',
    short: 'DBMS',
    faculty: 'Dr. Neha Kulkarni',
    credits: 4,
  },
  {
    id: 'crs_cn',
    code: 'BCA-206',
    name: 'Computer Networks',
    short: 'CN',
    faculty: 'Prof. Rajat Bhatia',
    credits: 4,
  },
  {
    id: 'crs_c',
    code: 'BCA-202',
    name: 'Programming in C',
    short: 'C Prog',
    faculty: 'Dr. Ananya Rao',
    credits: 4,
  },
  {
    id: 'crs_math',
    code: 'BCA-201',
    name: 'Mathematics',
    short: 'Maths',
    faculty: 'Prof. S. Venkatesh',
    credits: 3,
  },
  {
    id: 'crs_web',
    code: 'BCA-208',
    name: 'Web Development',
    short: 'Web Dev',
    faculty: 'Ms. Ritu Sharma',
    credits: 3,
  },
]

export const courseById = new Map(courses.map((course) => [course.id, course]))

/** Convenience for views that only have a course id to work with. */
export function courseName(id: string) {
  return courseById.get(id)?.name ?? 'Unknown course'
}
