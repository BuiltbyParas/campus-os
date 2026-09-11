import { useQuery } from '@tanstack/react-query'

import {
  getAttendance,
  getResults,
  getStudent,
  listCourses,
  listSessions,
} from './academics'
import { getEvent, listEvents, listNotifications, type EventFilters } from './campus'
import { getComplaint, listComplaints, type ComplaintFilters } from './complaints'
import { getEduProgress } from './campusLife'
import { getExams } from './examinations'
import { getFees } from './finance'
import { listAnnouncements, listDeadlines } from './signals'
import { composeToday } from './today'

/** One place to see every cache key in the app. */
export const keys = {
  student: ['student'] as const,
  courses: ['courses'] as const,
  attendance: ['attendance'] as const,
  timetable: ['timetable'] as const,
  complaints: (filters: ComplaintFilters = {}) => ['complaints', filters] as const,
  complaint: (id: string) => ['complaint', id] as const,
  events: (filters: EventFilters = {}) => ['events', filters] as const,
  event: (id: string) => ['event', id] as const,
  notifications: ['notifications'] as const,
  deadlines: ['deadlines'] as const,
  announcements: ['announcements'] as const,
  results: ['results'] as const,
  fees: ['fees'] as const,
  edu: ['edu-revolution'] as const,
  exams: ['examinations'] as const,
}

export function useStudent() {
  return useQuery({ queryKey: keys.student, queryFn: getStudent })
}

export function useCourses() {
  return useQuery({ queryKey: keys.courses, queryFn: listCourses })
}

export function useAttendance() {
  return useQuery({ queryKey: keys.attendance, queryFn: getAttendance })
}

export function useTimetable() {
  return useQuery({ queryKey: keys.timetable, queryFn: listSessions })
}

export function useComplaints(filters: ComplaintFilters = {}) {
  return useQuery({ queryKey: keys.complaints(filters), queryFn: () => listComplaints(filters) })
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: keys.complaint(id),
    queryFn: () => getComplaint(id),
    enabled: Boolean(id),
  })
}

export function useEvents(filters: EventFilters = {}) {
  return useQuery({ queryKey: keys.events(filters), queryFn: () => listEvents(filters) })
}

export function useEvent(id: string) {
  return useQuery({ queryKey: keys.event(id), queryFn: () => getEvent(id), enabled: Boolean(id) })
}

export function useNotifications() {
  return useQuery({ queryKey: keys.notifications, queryFn: listNotifications })
}

export function useDeadlines() {
  return useQuery({ queryKey: keys.deadlines, queryFn: listDeadlines })
}

export function useAnnouncements() {
  return useQuery({ queryKey: keys.announcements, queryFn: listAnnouncements })
}

export function useResults() {
  return useQuery({ queryKey: keys.results, queryFn: getResults })
}

export function useFees() {
  return useQuery({ queryKey: keys.fees, queryFn: getFees })
}

export function useEduProgress() {
  return useQuery({ queryKey: keys.edu, queryFn: getEduProgress })
}

export function useExams() {
  return useQuery({ queryKey: keys.exams, queryFn: getExams })
}

/**
 * Everything the Today view reasons over, in one hook.
 *
 * The dashboard, the command palette and the assistant all need the same four
 * datasets; fetching them together keeps their answers consistent and avoids
 * four separate loading states racing each other on screen.
 */
export function useCampusContext() {
  const attendance = useAttendance()
  const timetable = useTimetable()
  const complaints = useComplaints({ status: 'all' })
  const deadlines = useDeadlines()

  return {
    attendance,
    timetable,
    complaints,
    deadlines,
    isPending:
      attendance.isPending || timetable.isPending || complaints.isPending || deadlines.isPending,
    isError: attendance.isError || timetable.isError,
  }
}

/**
 * The Today view model.
 *
 * Composed here from the individual queries rather than by calling
 * `getToday()`, so each block on the dashboard can still show its own skeleton
 * while the others load — one aggregate query would mean one page-wide spinner.
 * The *derivation* is `composeToday`, which lives in the service layer and is
 * the same function the real `/today` endpoint will replace.
 *
 * When the backend ships that endpoint, this becomes a single `useQuery` over
 * `getToday()` and nothing in `Dashboard.tsx` changes.
 */
export function useToday(at: Date) {
  const attendance = useAttendance()
  const timetable = useTimetable()
  const complaints = useComplaints({ status: 'all' })
  const deadlines = useDeadlines()
  const events = useEvents()
  const announcements = useAnnouncements()
  const fees = useFees()
  const results = useResults()
  const edu = useEduProgress()
  const exams = useExams()

  const view = composeToday({
    attendance: attendance.data,
    timetable: timetable.data ?? [],
    complaints: complaints.data ?? [],
    deadlines: deadlines.data ?? [],
    events: events.data ?? [],
    notices: announcements.data ?? [],
    fees: fees.data,
    results: results.data,
    edu: edu.data,
    exams: exams.data,
    at,
  })

  return {
    view,
    /* The underlying queries come back too, so each block can render its own
       skeleton or retry instead of the page sharing one state. */
    queries: { attendance, timetable, complaints, deadlines, events, announcements, fees, results, edu, exams },
    isPending:
      attendance.isPending || timetable.isPending || complaints.isPending || deadlines.isPending,
    isError: attendance.isError || timetable.isError,
  }
}
