import { Bell, Menu, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/services/queries'

import { LogoMark } from './Logo'
import { MobileDrawer } from './MobileDrawer'

/**
 * The phone header.
 *
 * Three roles, left to right: a way into everything the thumb bar cannot hold,
 * identity, and the two things that are true right now — whether anything is
 * waiting, and the time. Navigation proper still lives in the tab bar at the
 * bottom, in thumb reach; the menu here is the overflow, not a second menu.
 */
export function MobileHeader({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const { student, readNotificationIds } = useStore()
  const notifications = useNotifications()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const unread = (notifications.data ?? []).filter(
    (item) => !item.read && !readNotificationIds.includes(item.id),
  ).length

  /* Ticks on the minute; the display has no seconds to show. */
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-[12px] md:hidden">
        <div className="flex h-16 items-center gap-1 px-2 pl-1">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="grid size-11 shrink-0 place-items-center rounded-full text-ink-muted transition-colors duration-200 active:bg-brand-soft active:text-ink"
          >
            <Menu className="size-[22px]" aria-hidden />
          </button>

          {/* The header carries six controls on a 390px screen, and the
              wordmark is the only one that can be dropped without losing a
              function — the mark alone still identifies the product. It
              returns as soon as there is room for it. */}
          <Link
            to="/app"
            className="-my-2 inline-flex min-w-0 items-center gap-2.5 rounded-tile px-1.5 py-2"
            aria-label="CampusOS dashboard"
          >
            <LogoMark className="size-8 shrink-0" />
            <span className="hidden truncate text-[17px] font-semibold tracking-tight text-ink sm:block">
              Campus<span className="text-brand">OS</span>
            </span>
          </Link>

          {/* The live clock, which is what makes every countdown on the screen
              below legible without arithmetic. */}
          <span className="ml-auto flex shrink-0 items-center gap-1.5 pr-1">
            <span aria-hidden className="relative flex size-1.5">
              <span className="absolute inline-flex size-full rounded-full bg-ok opacity-60 [animation:pulse-ring_2.4s_ease-out_infinite]" />
              <span className="relative inline-flex size-1.5 rounded-full bg-ok" />
            </span>
            <span className="text-[13px] font-bold tabular-nums text-brand-ink">
              {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </span>
          </span>

          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="grid size-11 shrink-0 place-items-center rounded-full text-ink-muted transition-colors duration-200 active:bg-brand-soft active:text-ink"
            aria-label="Search CampusOS"
          >
            <Search className="size-[20px]" aria-hidden />
          </button>

          <Link
            to="/app/notifications"
            className={cn(
              'relative grid size-11 shrink-0 place-items-center rounded-full text-ink-muted transition-colors duration-200 active:bg-brand-soft active:text-ink',
            )}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          >
            <Bell className="size-[20px]" aria-hidden />
            {unread > 0 ? (
              <span className="absolute right-1.5 top-1.5 grid min-w-[16px] place-items-center rounded-full bg-danger px-1 text-[9.5px] font-bold leading-[16px] text-white ring-2 ring-canvas">
                {unread}
              </span>
            ) : null}
          </Link>

          <Link
            to="/app/profile"
            className="grid size-11 shrink-0 place-items-center rounded-full"
            aria-label="Profile and settings"
          >
            <span className="grad-accent grid size-9 place-items-center rounded-full text-[12px] font-bold text-on-brand">
              {student.initials}
            </span>
          </Link>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenCommandPalette={onOpenCommandPalette}
      />
    </>
  )
}
