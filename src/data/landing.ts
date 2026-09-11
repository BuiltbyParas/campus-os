import {
  Bot,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  MessageSquareWarning,
  ScanLine,
  Settings2,
  type LucideIcon,
} from 'lucide-react'

/**
 * Every string on the marketing surface lives here so copy can be edited
 * without touching layout.
 *
 * Two rules govern this file:
 *  1. It only describes features that actually exist in the product.
 *  2. Every figure shown is demo data, and the page says so.
 */

export interface NavLink {
  label: string
  href: string
}

export const landingNav: NavLink[] = [
  { label: 'Platform', href: '#platform' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
]

export const hero = {
  eyebrow: 'THE DIGITAL CAMPUS, REIMAGINED',
  headline: ['Your campus.', 'One intelligent system.'],
  subtitle:
    'One place for everything students need — from attendance and timetables to campus services and AI-powered assistance.',
  primaryCta: { label: 'Enter CampusOS', to: '/app' },
  secondaryCta: { label: 'Explore the experience', href: '#platform' },
}

/* -------------------------------------------------------------- platform */

export interface Module {
  name: string
  description: string
  icon: LucideIcon
}

/** The eight surfaces that make up the student product — and nothing else. */
export const modules: Module[] = [
  {
    name: 'Dashboard',
    description: 'The day ahead in one glance — next class, attendance, and what needs action.',
    icon: LayoutDashboard,
  },
  {
    name: 'AI Assistant',
    description: 'Ask about your schedule or attendance and see the records behind the answer.',
    icon: Bot,
  },
  {
    name: 'Attendance',
    description: 'Live percentage per course, and exactly how many classes you can still miss.',
    icon: ScanLine,
  },
  {
    name: 'Timetable',
    description: 'Your week, with the class running right now marked as you look at it.',
    icon: CalendarDays,
  },
  {
    name: 'Report an issue',
    description: 'Photograph a problem, confirm the category, and send it in under a minute.',
    icon: MessageSquareWarning,
  },
  {
    name: 'Track resolution',
    description: 'Follow each request from submitted to resolved, with a timestamped trail.',
    icon: ClipboardList,
  },
  {
    name: 'Events',
    description: 'Fests, workshops and club activity — register without leaving the app.',
    icon: CalendarRange,
  },
  {
    name: 'Profile & settings',
    description: 'Identity, course list and notification preferences in one place.',
    icon: Settings2,
  },
]

/* -------------------------------------------------------------- features */

/**
 * The three MVP capabilities, each shown with the real demo record the product
 * would display. `caption` is the label above the sample, so the page never
 * implies these are live institutional figures.
 */
export interface Feature {
  eyebrow: string
  title: string
  description: string
  sample: {
    primary: string
    secondary: string
    meta?: string
    tone: 'danger' | 'warn' | 'brand'
    statusLabel: string
  }
  action: { label: string; to: string }
}

export const features: Feature[] = [
  {
    eyebrow: 'Attendance',
    title: 'Know where you stand, not just what you missed',
    description:
      'Every course shows its percentage against the requirement, and what it would take to recover.',
    sample: {
      primary: '72%',
      secondary: 'Overall attendance',
      meta: 'Database Management Systems is the weak point',
      tone: 'danger',
      statusLabel: 'Below required attendance',
    },
    action: { label: 'View attendance', to: '/app/attendance' },
  },
  {
    eyebrow: 'Report an issue',
    title: 'Requests that do not disappear',
    description:
      'Report a problem with a photo, then watch it move through every stage until it is closed.',
    sample: {
      primary: 'Hostel AC not working',
      secondary: 'Hostel 23 · Room 204',
      meta: 'Technician assigned · updated 4 hours ago',
      tone: 'warn',
      statusLabel: 'In Progress',
    },
    action: { label: 'Track complaint', to: '/app/complaints' },
  },
  {
    eyebrow: 'Timetable',
    title: 'The next place you need to be',
    description:
      'Your week, with today prioritised and the class running right now highlighted as you look.',
    sample: {
      primary: 'Database Management Systems',
      secondary: '10:00 AM · Block 34 · Room 204',
      meta: 'Dr. Neha Kulkarni',
      tone: 'brand',
      statusLabel: 'Next class',
    },
    action: { label: 'View timetable', to: '/app/timetable' },
  },
]

/* ---------------------------------------------------------- how it works */

export interface Step {
  title: string
  description: string
}

export const steps: Step[] = [
  {
    title: 'Sign in with your campus ID',
    description: 'One identity carries your programme, semester and section across every screen.',
  },
  {
    title: 'Your campus assembles itself',
    description:
      'Timetable, attendance and open requests load into a single dashboard built around your day.',
  },
  {
    title: 'Act without switching apps',
    description:
      'Check attendance, report a problem, register for an event, ask the assistant — all in one place.',
  },
]

/* ------------------------------------------------- dashboard preview data */

/**
 * The content rendered inside the product preview on the landing page.
 *
 * These values deliberately match the demo records in `src/data`, so the
 * preview is an honest picture of the product rather than a dressed-up mockup.
 */
export const previewData = {
  student: { name: 'Paras Attri', meta: 'BCA · Semester 2', initials: 'PA' },
  greeting: 'Good morning, Paras',
  date: 'Monday, 14 September',
  nextClass: {
    course: 'Database Management Systems',
    time: '10:00 AM',
    location: 'Block 34 · Room 204',
    faculty: 'Dr. Neha Kulkarni',
    starts: 'Starts in 25 min',
  },
  attendance: {
    overall: 72,
    required: 75,
    status: 'Below required attendance',
    courses: [
      { subject: 'Database Management Systems', value: 72 },
      { subject: 'Mathematics', value: 76 },
      { subject: 'Computer Networks', value: 81 },
    ],
  },
  complaint: {
    reference: 'CMP-1042',
    title: 'Hostel AC not working',
    location: 'Hostel 23 · Room 204',
    status: 'In Progress',
  },
  assistant: {
    question: 'Can I skip tomorrow’s DBMS?',
    answer:
      'I wouldn’t recommend it. You’re at 72%, below the 75% requirement. Skipping takes you to 69%.',
  },
}

/** The floating signals around the preview. */
export const floatingSignals = {
  attendance: { label: 'Attendance', value: '72%', note: 'Below requirement' },
  assistant: { label: 'AI Assistant', value: '3 questions answered', note: 'Today' },
  nextClass: { label: 'Next class', value: 'DBMS', note: '10:00 AM · Block 34' },
}

export const footerLinks: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Platform',
    links: [
      { label: 'Dashboard', href: '#platform' },
      { label: 'Attendance', href: '#features' },
      { label: 'Timetable', href: '#features' },
      { label: 'Complaints', href: '#features' },
    ],
  },
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'AI Assistant', href: '#platform' },
    ],
  },
]
