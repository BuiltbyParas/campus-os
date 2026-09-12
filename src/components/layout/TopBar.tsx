import { Bell, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/services/queries'

/**
 * The desktop top bar.
 *
 * Deliberately thin, and deliberately not a second navigation: the sidebar
 * already carries destinations. This carries the three things that are true
 * *right now* — the time, whether anything is waiting, and who is signed in.
 *
 * The clock is the reason it exists. A campus product is about being somewhere
 * at a particular time, and a live clock in the chrome makes every countdown
 * elsewhere on the screen legible without arithmetic.
 */
export function TopBar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const { student, readNotificationIds } = useStore()
  const notifications = useNotifications()

  const unread = (notifications.data ?? []).filter(
    (item) => !item.read && !readNotificationIds.includes(item.id),
  ).length

  /* Ticks on the minute rather than the second: the display has no seconds, so
     a per-second interval would repaint sixty times for one visible change. */
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
  const fullDate = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="glass-nav sticky top-0 z-40 hidden rounded-none border-x-0 border-t-0 lg:block">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-8">
        {/* ------------------------------------------------------- the clock */}
        <div className="group relative flex items-center gap-2">
          <span aria-hidden className="relative flex size-1.5">
            <span className="absolute inline-flex size-full rounded-full bg-ok opacity-60 [animation:pulse-ring_2.4s_ease-out_infinite]" />
            <span className="relative inline-flex size-1.5 rounded-full bg-ok" />
          </span>
          <p className="text-[16px] font-semibold tabular-nums text-brand-ink transition-colors duration-200 group-hover:text-brand">
            {time}
          </p>
          <span className="text-[12px] text-ink-subtle">Live</span>

          {/* the full date, on demand rather than always occupying the bar */}
          <span
            role="tooltip"
            className="pointer-events-none absolute left-0 top-full mt-1.5 whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink-muted opacity-0 shadow-e3 transition-opacity duration-200 group-hover:opacity-100"
          >
            {fullDate}
          </span>
        </div>

        {/* ----------------------------------------------------------- right */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface/60 pl-3 pr-2 text-[13px] text-ink-subtle transition-[color,border-color,background-color] duration-150 hover:border-line-strong hover:text-ink"
          >
            <Search className="size-4" aria-hidden />
            <span>Search</span>
            <kbd className="rounded border border-line px-1.5 py-0.5 text-[10.5px] font-medium">
              ⌘K
            </kbd>
          </button>

          <Link
            to="/app/notifications"
            className={cn(
              'relative grid size-9 place-items-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-surface hover:text-ink',
              /* The nudge only runs while something is actually unread, and
                 only on hover — an icon that twitches on its own is a tic. */
              unread > 0 && 'hover:[animation:bell-nudge_500ms_ease-in-out]',
            )}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          >
            <Bell className="size-[18px]" aria-hidden />
            {unread > 0 ? (
              <span className="absolute right-1 top-1 grid min-w-[15px] place-items-center rounded-full bg-danger px-1 text-[9.5px] font-semibold leading-[15px] text-white">
                {unread}
              </span>
            ) : null}
          </Link>

          <Link
            to="/app/profile"
            aria-label="Your profile"
            className="lift ml-1 grid size-9 place-items-center rounded-full border border-line bg-brand-soft text-[12.5px] font-semibold text-brand-ink"
          >
            {student.initials}
          </Link>
        </div>
      </div>
    </header>
  )
}
