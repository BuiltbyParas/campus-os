import type { CampusEvent, EventCategory } from '@/types'

import { dayOffset } from './_time'

export const eventCategoryLabel: Record<EventCategory, string> = {
  tech: 'Tech',
  cultural: 'Cultural',
  sports: 'Sports',
  workshop: 'Workshop',
  talk: 'Talk',
}

/**
 * Demo campus events, dated relative to whenever the app is opened so the list
 * never shows a stale "last week" on demo day. Fictional.
 */
export const events: CampusEvent[] = [
  {
    id: 'evt_1',
    title: 'Hack the Campus 2026',
    description:
      'A 24-hour build sprint on problems drawn from campus life. Teams of up to four, hardware and mentors provided.',
    category: 'tech',
    date: dayOffset(2),
    startTime: '09:00',
    endTime: '18:00',
    venue: 'Block 34 · Auditorium',
    organizer: 'Computing Society',
    capacity: 240,
    registered: 186,
    featured: true,
  },
  {
    id: 'evt_2',
    title: 'Intro to Database Indexing',
    description:
      'A practical workshop on how indexes actually change query plans, run by the DBMS faculty. Bring a laptop.',
    category: 'workshop',
    date: dayOffset(1),
    startTime: '15:30',
    endTime: '17:00',
    venue: 'Block 32 · Lab 3',
    organizer: 'Dr. Neha Kulkarni',
    capacity: 60,
    registered: 47,
  },
  {
    id: 'evt_3',
    title: 'Inter-Hostel Football Final',
    description: 'Hostel 23 against Hostel 24. The last fixture of the season.',
    category: 'sports',
    date: dayOffset(4),
    startTime: '17:00',
    endTime: '19:00',
    venue: 'Sports Complex · Main Ground',
    organizer: 'Sports Committee',
    capacity: 800,
    registered: 312,
  },
  {
    id: 'evt_4',
    title: 'Open Mic Night',
    description: 'Music, poetry and stand-up from across the campus. Sign-ups close an hour before.',
    category: 'cultural',
    date: dayOffset(6),
    startTime: '19:00',
    endTime: '22:00',
    venue: 'Block 34 · Amphitheatre',
    organizer: 'Cultural Committee',
    capacity: 350,
    registered: 128,
  },
  {
    id: 'evt_5',
    title: 'Careers in Systems Engineering',
    description:
      'A talk from alumni working on distributed systems, followed by an open question session.',
    category: 'talk',
    date: dayOffset(9),
    startTime: '14:00',
    endTime: '15:30',
    venue: 'Library · Seminar Room',
    organizer: 'Placement Cell',
    capacity: 120,
    registered: 94,
  },
  {
    id: 'evt_6',
    title: 'Git & Version Control Clinic',
    description:
      'A drop-in session for untangling merge conflicts and setting up a sane branching workflow.',
    category: 'workshop',
    date: dayOffset(12),
    startTime: '16:00',
    endTime: '17:30',
    venue: 'Block 32 · Lab 1',
    organizer: 'Computing Society',
    capacity: 40,
    registered: 12,
  },
]

export const eventById = new Map(events.map((event) => [event.id, event]))
