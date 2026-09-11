import { events, notifications } from '@/data'
import type { AppNotification, CampusEvent, EventCategory } from '@/types'

import { request } from './http'

/** Events and notifications. */

export interface EventFilters {
  category?: EventCategory | 'all'
}

export function listEvents(filters: EventFilters = {}): Promise<CampusEvent[]> {
  return request(`/events?category=${filters.category ?? 'all'}`, () => {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
    if (!filters.category || filters.category === 'all') return sorted
    return sorted.filter((event) => event.category === filters.category)
  })
}

export function getEvent(id: string): Promise<CampusEvent | undefined> {
  return request(`/events/${id}`, () => events.find((event) => event.id === id))
}

export function listNotifications(): Promise<AppNotification[]> {
  return request('/notifications', () =>
    [...notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    ),
  )
}
