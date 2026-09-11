import type { AppNotification } from '@/types'

import { hoursAgo, minutesAgo } from './_time'

/** Demo notifications, each tied to a real screen in the product. */
export const notifications: AppNotification[] = [
  {
    id: 'ntf_1',
    type: 'attendance',
    title: 'DBMS attendance is below the requirement',
    message: 'You are at 72%. Attending the next 3 classes brings you back to 75%.',
    timestamp: hoursAgo(3),
    read: false,
    href: '/app/attendance',
  },
  {
    id: 'ntf_2',
    type: 'complaint',
    title: 'CMP-1042 · Repair in progress',
    message: 'The technician inspected your AC and is waiting on a replacement part.',
    timestamp: hoursAgo(4),
    read: false,
    href: '/app/complaints/cmp_1042',
  },
  {
    id: 'ntf_3',
    type: 'complaint',
    title: 'CMP-1038 needs your confirmation',
    message: 'IT services replaced the access point in Lab 3. Confirm whether it is stable.',
    timestamp: hoursAgo(20),
    read: false,
    href: '/app/complaints/cmp_1038',
  },
  {
    id: 'ntf_4',
    type: 'timetable',
    title: 'Mathematics tutorial moved',
    message: 'Wednesday’s tutorial is now at 15:00 in Block 32 · Room 118.',
    timestamp: hoursAgo(28),
    read: true,
    href: '/app/timetable',
  },
  {
    id: 'ntf_5',
    type: 'event',
    title: 'Hack the Campus registration closes soon',
    message: '186 of 240 places are taken.',
    timestamp: minutesAgo(150),
    read: true,
    href: '/app/events',
  },
]
