import { courseById } from '@/data'
import type { NavItem } from '@/app/navigation'
import { useToday } from '@/services/queries'

export type NavBadge = { value: string; tone: string }
export type NavBadges = Partial<Record<NonNullable<NavItem['badge']>, NavBadge>>

/**
 * The live counts navigation rows carry.
 *
 * Derived from the same `TodayView` every screen renders, so a badge can never
 * advertise something its destination does not show. Shared by the desktop
 * rail and the mobile drawer — two navigations disagreeing about how many
 * requests are open would be worse than neither showing a count.
 */
export function useNavBadges(): NavBadges {
  const { view } = useToday(new Date())
  const badges: NavBadges = {}

  if (view.weakestCourse && view.weakestCourse.status !== 'safe') {
    badges.attendance = {
      value: `${Math.round(view.weakestCourse.percentage)}%`,
      tone:
        view.weakestCourse.status === 'below'
          ? 'bg-danger-soft text-danger-ink'
          : 'bg-warn-soft text-warn-ink',
    }
  }

  if (view.openRequests.length > 0) {
    badges.complaints = {
      value: String(view.openRequests.length),
      tone: 'bg-brand-soft text-brand-ink',
    }
  }

  if (view.exams?.next) {
    badges.exams = { value: 'soon', tone: 'bg-warn-soft text-warn-ink' }
  }

  if (view.fees?.nextDue) {
    badges.fees = { value: 'due', tone: 'bg-warn-soft text-warn-ink' }
  }

  /* Kept for callers that want to name the course the attendance badge is
     about — the drawer has room for it, the 90px rail does not. */
  if (view.weakestCourse) {
    const short = courseById.get(view.weakestCourse.courseId)?.short
    if (short && badges.attendance) badges.attendance.value = `${short} ${badges.attendance.value}`
  }

  return badges
}
