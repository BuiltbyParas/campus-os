import { useQuery } from '@tanstack/react-query'

import {
  getAttendance,
  getStudent,
  listCourses,
  listSessions,
} from './academics'
import { getEvent, listEvents, listNotifications, type EventFilters } from './campus'
import { getComplaint, listComplaints, type ComplaintFilters } from './complaints'

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
