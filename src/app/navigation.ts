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
  /**
   * Which live count the rail should show against this row, if any.
   *
   * The name of a signal rather than a number: navigation is static data and
   * must not reach into a query. `Sidebar` resolves these against the demo
   * dataset, so a row can never advertise a count the page does not show.
   */
  badge?: 'attendance' | 'exams' | 'fees' | 'events' | 'complaints'
}

/**
 * Navigation, grouped.
 *
 * Nine flat rows is a list to be read; two labelled groups is a structure to be
 * scanned. The split is by *cadence* rather than by department — the top group
 * is what a student opens between classes, the second is what they open a few
 * times a semester.
 */
export const navSections: { id: string; label?: string; items: NavItem[] }[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/app/assistant', label: 'AI Assistant', shortLabel: 'Assistant', icon: Sparkles },
      { to: '/app/attendance', label: 'Attendance', icon: ScanLine, badge: 'attendance' },
      { to: '/app/timetable', label: 'Timetable', icon: CalendarDays },
      { to: '/app/academics', label: 'Academics', icon: GraduationCap },
      { to: '/app/exams', label: 'Examinations', shortLabel: 'Exams', icon: FileText, badge: 'exams' },
    ],
  },
  {
    id: 'campus',
    label: 'Campus',
    items: [
      { to: '/app/fees', label: 'Fees', icon: Wallet, badge: 'fees' },
      { to: '/app/events', label: 'Events', icon: CalendarRange, badge: 'events' },
      { to: '/app/complaints', label: 'Complaints', icon: MessageSquareWarning, badge: 'complaints' },
    ],
  },
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
