import {
  CalendarDays,
  CalendarRange,
  Megaphone,
  MessageSquareWarning,
  ScanLine,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { cn, formatRelative } from '@/lib/utils'
import { useNotifications } from '@/services/queries'
import type { NotificationType } from '@/types'

const icons: Record<NotificationType, typeof ScanLine> = {
  attendance: ScanLine,
  timetable: CalendarDays,
  complaint: MessageSquareWarning,
  event: CalendarRange,
  campus: Megaphone,
}

export default function Notifications() {
  const { readNotificationIds, markNotificationRead, markAllNotificationsRead } = useStore()
  const notifications = useNotifications()

  const items = notifications.data ?? []
  const isRead = (id: string, read: boolean) => read || readNotificationIds.includes(id)
  const unreadCount = items.filter((item) => !isRead(item.id, item.read)).length

  return (
    <PageContainer width="narrow" className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllNotificationsRead(items.map((item) => item.id))}
              className="press inline-flex h-10 items-center rounded-control border border-line bg-surface px-3.5 text-[13px] font-medium text-ink-muted hover:border-line-strong hover:text-ink"
            >
              Mark all read
            </button>
          ) : undefined
        }
      />

      {notifications.isPending ? (
        <div className="rounded-card border border-line bg-surface p-5">
          <SkeletonRows count={4} />
        </div>
      ) : notifications.isError ? (
        <ErrorState onRetry={() => notifications.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Updates about your campus life land here." />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {items.map((item) => {
            const Icon = icons[item.type]
            const read = isRead(item.id, item.read)

            const body = (
              <div className="flex items-start gap-3.5 px-4 py-4 sm:px-5">
                <span
                  className={cn(
                    'mt-0.5 grid size-9 shrink-0 place-items-center rounded-full',
                    read ? 'bg-surface-muted text-ink-subtle' : 'bg-brand-soft text-brand-ink',
                  )}
                >
                  <Icon className="size-[17px]" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={cn(
                        'text-[14px] leading-snug',
                        read ? 'font-medium text-ink-muted' : 'font-semibold text-ink',
                      )}
                    >
                      {item.title}
                    </p>
                    {!read ? (
                      <span
                        aria-label="Unread"
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{item.message}</p>
                  <p className="mt-1.5 text-[12px] text-ink-subtle">
                    {formatRelative(item.timestamp)}
                  </p>
                </div>
              </div>
            )

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    to={item.href}
                    onClick={() => markNotificationRead(item.id)}
                    className="block transition-colors hover:bg-surface-raised"
                  >
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            )
          })}
        </ul>
      )}
    </PageContainer>
  )
}
