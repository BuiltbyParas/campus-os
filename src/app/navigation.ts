import {
  CalendarDays,
  CalendarRange,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquareWarning,
  ScanLine,
  Settings,
  Sparkles,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  /** Shorter label for the mobile tab bar. */
  shortLabel?: string
  icon: LucideIcon
  end?: boolean
}

/**
 * The desktop sidebar.
 *
 * A destination only appears here once the screen behind it is real, and
 * related records share a destination rather than each claiming a row:
 * `Academics` carries marks, re-evaluation and EDU-Revolution together,
 * because a student reads them as one question rather than three.
 */
export const primaryNav: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/assistant', label: 'AI Assistant', shortLabel: 'Assistant', icon: Sparkles },
  { to: '/app/attendance', label: 'Attendance', icon: ScanLine },
  { to: '/app/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/app/academics', label: 'Academics', icon: GraduationCap },
  { to: '/app/exams', label: 'Examinations', shortLabel: 'Exams', icon: FileText },
  { to: '/app/fees', label: 'Fees', icon: Wallet },
  { to: '/app/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/app/events', label: 'Events', icon: CalendarRange },
]

/** Account destinations, separated from the day-to-day work above. */
export const accountNav: NavItem[] = [
  { to: '/app/profile', label: 'Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

/**
 * The mobile tab bar. Five destinations is the most a thumb bar should carry,
 * so the assistant moves to a floating action and account lives in the header.
 */
export const bottomNav: NavItem[] = [
  { to: '/app', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/app/attendance', label: 'Attendance', shortLabel: 'Attend', icon: ScanLine },
  { to: '/app/timetable', label: 'Timetable', shortLabel: 'Classes', icon: CalendarDays },
  { to: '/app/complaints', label: 'Complaints', shortLabel: 'Issues', icon: MessageSquareWarning },
  { to: '/app/events', label: 'Events', icon: CalendarRange },
]
