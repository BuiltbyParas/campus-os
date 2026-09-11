import type { EduActivity, EduProgress } from '@/types'

import { dayOffset } from './_time'

/**
 * EDU-Revolution — the co-curricular track.
 *
 * **Fictional.** These activities, their requirements and the 5-activity target
 * are invented for the prototype. Nothing here reflects a real institution's
 * co-curricular policy, and the UI labels the whole record as demo data.
 */

const activities: EduActivity[] = [
  {
    id: 'edu_1',
    title: 'Community teaching drive',
    category: 'Social outreach',
    status: 'completed',
    detail: 'Ran four weekend sessions at a nearby school.',
    completedOn: dayOffset(-64),
  },
  {
    id: 'edu_2',
    title: 'Inter-department hackathon',
    category: 'Technical',
    status: 'completed',
    detail: 'Built a campus navigation prototype in a 24-hour team event.',
    completedOn: dayOffset(-38),
  },
  {
    id: 'edu_3',
    title: 'Public speaking workshop',
    category: 'Communication',
    status: 'completed',
    detail: 'Six-session programme ending in a graded presentation.',
    completedOn: dayOffset(-12),
  },
  {
    id: 'edu_4',
    title: 'Open-source contribution sprint',
    category: 'Technical',
    status: 'in-progress',
    detail: 'Two of three merged pull requests recorded so far.',
    recommended: true,
  },
  {
    id: 'edu_5',
    title: 'Industry mentorship track',
    category: 'Career',
    status: 'pending',
    detail: 'Opens once the contribution sprint is signed off.',
  },
]

const completed = activities.filter((activity) => activity.status === 'completed').length

export const eduProgress: EduProgress = {
  completed,
  required: 5,
  activities,
  /* The one the product suggests next: the activity already under way beats
     one not yet started, because finishing it is the shortest path. */
  nextRecommended:
    activities.find((activity) => activity.recommended && activity.status !== 'completed') ??
    activities.find((activity) => activity.status !== 'completed'),
  source: 'demo',
}
