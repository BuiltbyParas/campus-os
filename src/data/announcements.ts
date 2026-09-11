import type { Id } from '@/types'

import { dayOffset } from './_time'

/**
 * Campus-wide service notices.
 *
 * These are the things a student currently learns from a noticeboard, a group
 * chat, or not at all — a closed floor, a maintenance window. They are campus
 * facts rather than personal records, which is what keeps Campus Pulse distinct
 * from the student's own request history. Fictional.
 */
export interface Announcement {
  id: Id
  title: string
  detail: string
  /** ISO date the notice applies to. */
  date: string
  startTime: string
  endTime?: string
}

export const announcements: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Library maintenance',
    detail: 'Floor 2 closed for electrical work',
    date: dayOffset(0),
    startTime: '12:00',
    endTime: '16:00',
  },
  {
    id: 'ann_2',
    title: 'Wi-Fi upgrade in Block 32',
    detail: 'Intermittent connectivity in labs 1–3',
    date: dayOffset(1),
    startTime: '07:00',
    endTime: '09:00',
  },
  {
    id: 'ann_3',
    title: 'Hostel water supply interruption',
    detail: 'Hostels 23 and 24, tanks being cleaned',
    date: dayOffset(1),
    startTime: '14:00',
    endTime: '17:00',
  },
]
