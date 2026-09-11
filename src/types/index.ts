/**
 * Shared domain models for CampusOS.
 *
 * These mirror the shape the backend is expected to return, so the same types
 * describe today's demo data and tomorrow's API payloads. Anything the UI needs
 * to render should be expressible here — components must never invent fields.
 */

export type Id = string

/** Where a value came from. The UI must never present demo data as official. */
export type DataSource = 'demo' | 'live'

/* --------------------------------------------------------------- Student */

export interface Student {
  id: Id
  name: string
  initials: string
  email: string
  program: string
  semester: number
  rollNumber: string
  section: string
  hostel: string
  room: string
  avatarUrl?: string
}

/* ---------------------------------------------------------------- Course */

export interface Course {
  id: Id
  /** Registrar code, e.g. "BCA-204". */
  code: string
  name: string
  /** Compact label for dense views, e.g. "DBMS". */
  short: string
  faculty: string
  credits: number
}

/* ------------------------------------------------------------ Attendance */

/**
 * `safe`     — comfortably above the requirement
 * `at-risk`  — above it, but one or two absences from falling below
 * `below`    — under the requirement right now
 */
export type AttendanceStatus = 'safe' | 'at-risk' | 'below'

export interface CourseAttendance {
  courseId: Id
  attended: number
  held: number
  percentage: number
  requiredPercentage: number
  status: AttendanceStatus
  /** Classes that can still be missed while staying at or above the requirement. */
  canMiss: number
  /** Consecutive classes needed to climb back to the requirement. 0 when already there. */
  mustAttend: number
}

export interface AttendanceSummary {
  overallPercentage: number
  requiredPercentage: number
  totalAttended: number
  totalHeld: number
  status: AttendanceStatus
  courses: CourseAttendance[]
  /** Demo figures are labelled in the UI wherever this is `demo`. */
  source: DataSource
  updatedAt: string
}

/* -------------------------------------------------------------- Timetable */

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

export type SessionKind = 'lecture' | 'lab' | 'tutorial'

export type SessionStatus = 'completed' | 'ongoing' | 'upcoming' | 'cancelled'

export interface ClassSession {
  id: Id
  courseId: Id
  day: Weekday
  /** 24h local time, e.g. "10:00". */
  startTime: string
  endTime: string
  kind: SessionKind
  block: string
  room: string
  faculty: string
  /** Set by the timetable service against the current clock, never stored. */
  status?: SessionStatus
  note?: string
}

/* ------------------------------------------------------------- Complaints */

export type ComplaintCategory =
  | 'hvac'
  | 'electrical'
  | 'plumbing'
  | 'furniture'
  | 'internet'
  | 'cleanliness'
  | 'other'

export type ComplaintPriority = 'low' | 'medium' | 'high'

/** The lifecycle a request moves through, in order. */
export type ComplaintStage =
  | 'submitted'
  | 'assigned'
  | 'technician-assigned'
  | 'in-progress'
  | 'verification'
  | 'resolved'

export interface ComplaintTimelineEntry {
  stage: ComplaintStage
  /** Plain-language summary a student can read without decoding jargon. */
  description: string
  timestamp: string
  actor?: string
}

export interface Complaint {
  id: Id
  /** Short public reference shown to the student, e.g. "CMP-1042". */
  reference: string
  title: string
  description: string
  category: ComplaintCategory
  priority: ComplaintPriority
  block: string
  room: string
  stage: ComplaintStage
  createdAt: string
  updatedAt: string
  photoCount: number
  assignee?: { name: string; team: string }
  timeline: ComplaintTimelineEntry[]
}

/** Payload the create-complaint form sends. Mirrors the future POST body. */
export interface ComplaintDraft {
  title: string
  description: string
  category: ComplaintCategory
  priority: ComplaintPriority
  block: string
  room: string
  photoCount: number
}

/* ----------------------------------------------------------------- Events */

export type EventCategory = 'tech' | 'cultural' | 'sports' | 'workshop' | 'talk'

export interface CampusEvent {
  id: Id
  title: string
  description: string
  category: EventCategory
  /** ISO date, e.g. 2026-09-15 */
  date: string
  startTime: string
  endTime: string
  venue: string
  organizer: string
  capacity: number
  registered: number
  featured?: boolean
}

/* ---------------------------------------------------------- Notifications */

export type NotificationType = 'attendance' | 'timetable' | 'complaint' | 'event' | 'campus'

export interface AppNotification {
  id: Id
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  href?: string
}

/* -------------------------------------------------------------- Assistant */

export type ChatRole = 'user' | 'assistant'

/**
 * Where a sentence in an assistant answer came from. Rendering these is not
 * decoration: it is how a student can tell a real record from a demo rule.
 */
export interface AssistantSource {
  kind: 'attendance' | 'timetable' | 'complaints' | 'policy'
  label: string
  detail: string
  /** `demo` sources render with a DEMO marker so nothing reads as official. */
  source: DataSource
}

/** A figure the assistant used, surfaced so the reasoning is inspectable. */
export interface AssistantDataPoint {
  label: string
  value: string
  tone?: 'neutral' | 'ok' | 'warn' | 'danger'
}

export interface AssistantAction {
  label: string
  to: string
}

export interface ChatMessage {
  id: Id
  role: ChatRole
  content: string
  data?: AssistantDataPoint[]
  sources?: AssistantSource[]
  actions?: AssistantAction[]
  pending?: boolean
}

/* ------------------------------------------------------------- Preferences */

export interface NotificationPreferences {
  attendanceAlerts: boolean
  timetableChanges: boolean
  complaintUpdates: boolean
  eventReminders: boolean
}

export interface AppPreferences {
  weekStartsMonday: boolean
  compactTimetable: boolean
  showDemoLabels: boolean
}
