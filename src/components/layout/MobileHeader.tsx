import { Bell, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { useNotifications } from '@/services/queries'

import { Logo } from './Logo'

/**
 * Compact mobile header: identity and alerts only. Navigation lives in the tab
 * bar at the bottom, within thumb reach — the header is not a second menu.
 */
export function MobileHeader({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const { student, readNotificationIds } = useStore()
  const notifications = useNotifications()

  const unread = (notifications.data ?? []).filter(
    (item) => !item.read && !readNotificationIds.includes(item.id),
  ).length

  return (
    <header className="glass-nav sticky top-0 z-40 rounded-none border-x-0 border-t-0 lg:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link to="/app" className="-my-2 inline-flex items-center rounded-lg py-2" aria-label="CampusOS dashboard">
          <Logo />
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="grid size-10 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            aria-label="Search CampusOS"
          >
            <Search className="size-[19px]" aria-hidden />
          </button>

          <Link
            to="/app/notifications"
            className="relative grid size-10 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          >
            <Bell className="size-[19px]" aria-hidden />
            {unread > 0 ? (
              <span
                aria-hidden
                className="absolute right-2 top-2 size-2 rounded-full bg-brand ring-2 ring-canvas"
              />
            ) : null}
          </Link>

          <Link
            to="/app/profile"
            className="grid size-10 place-items-center rounded-full"
            aria-label="Profile and settings"
          >
            <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-[11.5px] font-semibold text-brand-ink">
              {student.initials}
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
