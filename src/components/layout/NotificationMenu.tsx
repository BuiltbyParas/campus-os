import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { popIn } from '@/lib/motion'
import { cn, formatRelative } from '@/lib/utils'
import { useNotifications } from '@/services/queries'
import type { AppNotification } from '@/types'

/**
 * The notification panel.
 *
 * A dropdown rather than a trip to a page, because the whole point of a
 * notification is that it should cost nothing to check. The page still exists
 * for the full history — this is the last few, grouped by nothing and ordered
 * by time, which is how someone actually scans them.
 */

const typeTone: Record<AppNotification['type'], string> = {
  attendance: 'bg-danger-soft text-danger-ink',
  timetable: 'bg-info-soft text-info-ink',
  complaint: 'bg-brand-soft text-brand-ink',
  event: 'bg-ok-soft text-ok-ink',
  campus: 'bg-warn-soft text-warn-ink',
}

export function NotificationMenu() {
  const { readNotificationIds, markNotificationRead, markAllNotificationsRead } = useStore()
  const notifications = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items = notifications.data ?? []
  const isRead = (item: AppNotification) => item.read || readNotificationIds.includes(item.id)
  const unread = items.filter((item) => !isRead(item)).length

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className={cn(
          'relative grid size-10 place-items-center rounded-full text-ink-subtle transition-colors duration-200 hover:bg-brand-soft hover:text-ink',
          unread > 0 && 'hover:[animation:bell-nudge_500ms_ease-in-out]',
        )}
      >
        <Bell className="size-[20px]" aria-hidden />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 grid min-w-[17px] animate-[count-pop_400ms_var(--ease-premium)] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-[17px] text-white ring-2 ring-canvas">
            {unread}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            variants={popIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="glass-modal absolute right-0 top-[calc(100%+10px)] z-50 w-[380px] overflow-hidden rounded-xl elev-3"
          >
            <div className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3">
              <p className="text-[14px] font-bold text-ink">
                Notifications
                {unread > 0 ? (
                  <span className="ml-2 rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger-ink">
                    {unread} new
                  </span>
                ) : null}
              </p>
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={() => markAllNotificationsRead(items.map((item) => item.id))}
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-semibold text-brand-ink transition-colors hover:bg-brand-soft"
                >
                  <Check className="size-3.5" aria-hidden />
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="scrollbar-premium max-h-[380px] overflow-y-auto p-1.5">
              {items.length === 0 ? (
                <p className="px-3 py-8 text-center text-[13px] text-ink-subtle">
                  Nothing yet. Alerts about attendance, timetable changes and your requests arrive
                  here.
                </p>
              ) : (
                items.slice(0, 8).map((item) => (
                  <Link
                    key={item.id}
                    to={item.href ?? '/app/notifications'}
                    role="menuitem"
                    onClick={() => {
                      markNotificationRead(item.id)
                      setOpen(false)
                    }}
                    className="flex gap-3 rounded-lg p-3 transition-colors duration-200 hover:bg-brand-soft"
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold uppercase',
                        typeTone[item.type],
                      )}
                      aria-hidden
                    >
                      {item.type.slice(0, 2)}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="line-clamp-1 text-[13.5px] font-semibold text-ink">
                          {item.title}
                        </span>
                        {!isRead(item) ? (
                          <span
                            aria-label="Unread"
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                          />
                        ) : null}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-relaxed text-ink-subtle">
                        {item.message}
                      </span>
                      <span className="mt-1 block text-[11px] text-ink-faint">
                        {formatRelative(item.timestamp)}
                      </span>
                    </span>
                  </Link>
                ))
              )}
            </div>

            <Link
              to="/app/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-divider px-4 py-3 text-center text-[13px] font-semibold text-brand-ink transition-colors hover:bg-brand-soft"
            >
              View all notifications
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
