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
  /**
   * Running percentage after each recorded week, oldest first.
   *
   * Derived from the same weekly ledger as `attended` / `held`, so the trend a
   * student sees can never disagree with the figure printed beside it.
   */
  trend?: number[]
}

export interface AttendanceSummary {
  overallPercentage: number
  requiredPercentage: number
  totalAttended: number
  totalHeld: number
  status: AttendanceStatus
  courses: CourseAttendance[]
  /** Running overall percentage after each recorded week, oldest first. */
  trend?: number[]
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

/* ------------------------------------------------------------- Deadlines */

export type DeadlineKind = 'assignment' | 'quiz' | 'submission' | 'exam'

export interface Deadline {
  id: Id
  courseId: Id
  title: string
  kind: DeadlineKind
  /** ISO date, e.g. 2026-09-15 */
  date: string
  /** 24h local time the work is due. */
  dueTime: string
  submitted: boolean
}

/* ----------------------------------------------------------- Day agenda */

/**
 * One entry in the student's merged day.
 *
 * Classes, deadlines, events and the gaps between them are different records in
 * different services, but a student experiences them as a single chronological
 * day. `lib/agenda` merges them into this shape so the Today view can render one
 * timeline instead of three stacked lists.
 */
export type AgendaKind = 'class' | 'deadline' | 'event' | 'gap'

export interface AgendaItem {
  id: Id
  kind: AgendaKind
  /** 24h local time used for ordering. */
  startTime: string
  endTime?: string
  title: string
  subtitle?: string
  /** Minutes from "now" until it starts. Negative once it has begun. */
  minutesUntil: number
  status: 'past' | 'now' | 'next' | 'upcoming'
  to?: string
}

/* -------------------------------------------------------------- Signals */

/**
 * A proactive prompt: something CampusOS noticed on the student's behalf.
 *
 * Signals are *derived*, never authored — each one is produced by a rule that
 * reads real records, so the interface can never nag about something untrue.
 * `urgency` orders them; only the top few are ever shown.
 */
export type SignalTone = 'info' | 'ok' | 'warn' | 'danger'

export interface Signal {
  id: Id
  tone: SignalTone
  title: string
  detail: string
  /**
   * The one figure this signal is about — "72%", "₹18,500", "6 days".
   *
   * Optional because not every signal has one. Where it exists the UI can set
   * it as the visual anchor and let the sentence become supporting text, which
   * is the difference between reading an alert and seeing it.
   */
  metric?: string
  /** Higher sorts first. Derived from how soon and how consequential it is. */
  urgency: number
  action?: { label: string; to: string }
  source: 'attendance' | 'timetable' | 'complaint' | 'deadline' | 'event' | 'fee' | 'result' | 'edu' | 'exam'
}

/* ------------------------------------------------------------- Insights */

/** A small derived observation about the student's own week. */
export interface Insight {
  label: string
  value: string
  detail?: string
  tone?: SignalTone
  /**
   * 0–100, when the figure is genuinely a proportion of something.
   * Rendered as a meter beside the value; omitted where a bar would be a
   * decoration rather than a second reading of the number.
   */
  progress?: number
}

/* ------------------------------------------------------- Command palette */

export type CommandKind = 'action' | 'info' | 'navigation' | 'assistant'

export interface CommandItem {
  id: Id
  kind: CommandKind
  title: string
  subtitle?: string
  /** Extra words this entry should match on, beyond its title. */
  keywords?: string[]
  to: string
  /** Shown on the right — a live value such as "72%". */
  badge?: string
  badgeTone?: SignalTone
}

/* ------------------------------------------------------ Academic records */

/**
 * One assessed piece of work.
 *
 * Scores are stored raw — obtained out of max, plus the weight it carries
 * toward the course. Every aggregate the UI shows is derived from these, so a
 * course percentage can never drift from the marks it came from.
 */
export interface Assessment {
  id: Id
  courseId: Id
  /** e.g. "CA 1", "Mid-term". */
  name: string
  score: number
  maxScore: number
  /** Percentage of the course this assessment contributes. */
  weight: number
  publishedAt: string
}

export interface CourseResult {
  courseId: Id
  assessments: Assessment[]
  /** Weighted marks earned so far, out of the weight assessed so far. */
  obtained: number
  assessed: number
  percentage: number
  /** Weight still unassessed — what is left to play for. */
  remainingWeight: number
  publishedAt: string
}

export interface ResultsSummary {
  courses: CourseResult[]
  /** Weighted mean across everything assessed so far. */
  overallPercentage: number
  latest?: CourseResult
  source: DataSource
}

/* -------------------------------------------------------- Examinations */

export type ExamKind = 'mid-term' | 'end-term' | 'practical'

/**
 * A seat allocation.
 *
 * Released separately from — and usually days after — the schedule itself,
 * which is why it is optional on `Exam`. "Not published yet" is a real state
 * the product must be able to say out loud rather than render as a blank.
 */
export interface ExamSeat {
  block: string
  room: string
  /** Seat label as printed on the plan, e.g. "B-12". */
  seat: string
  /** Plain-language locator, e.g. "Row 3, second from the window". */
  note?: string
  /** When the allocation was published. */
  publishedAt: string
}

export interface Exam {
  id: Id
  courseId: Id
  kind: ExamKind
  /** ISO date, e.g. 2026-09-30 */
  date: string
  /** 24h local times. */
  startTime: string
  endTime: string
  seat?: ExamSeat
  /** Instructions specific to this paper, e.g. permitted materials. */
  note?: string
}

export interface ExamSchedule {
  exams: Exam[]
  /** The soonest exam still ahead. Derived, never stored. */
  next?: Exam
  /** How many of the listed exams have a seat allocation yet. */
  seatsPublished: number
  source: DataSource
}

/* --------------------------------------------------------------- Finance */

export type FeeStatus = 'paid' | 'due' | 'upcoming'

/** A single line in the fee breakdown, e.g. tuition or hostel. */
export interface FeeLine {
  label: string
  amount: number
  note?: string
}

export interface FeeInstalment {
  id: Id
  label: string
  amount: number
  /** ISO date. */
  dueDate: string
  status: FeeStatus
  paidOn?: string
  method?: string
  reference?: string
}

export interface FeeSummary {
  /** ISO 4217. Amounts are minor-unit free — whole rupees. */
  currency: string
  totalPayable: number
  totalPaid: number
  outstanding: number
  breakdown: FeeLine[]
  instalments: FeeInstalment[]
  scholarship?: { name: string; amount: number }
  /** The next thing actually owed, derived rather than stored. */
  nextDue?: FeeInstalment
  source: DataSource
}

/* -------------------------------------------------- Co-curricular track */

export type EduActivityStatus = 'completed' | 'in-progress' | 'pending'

/**
 * An EDU-Revolution activity.
 *
 * A fictional co-curricular track used to show progress rather than a
 * navigation item that leads to an empty page.
 */
export interface EduActivity {
  id: Id
  title: string
  category: string
  status: EduActivityStatus
  detail: string
  completedOn?: string
  /** The one the product suggests doing next. */
  recommended?: boolean
}

export interface EduProgress {
  completed: number
  required: number
  activities: EduActivity[]
  nextRecommended?: EduActivity
  source: DataSource
}
