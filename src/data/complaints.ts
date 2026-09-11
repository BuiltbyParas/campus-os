import type { Complaint, ComplaintCategory, ComplaintStage, ComplaintPriority } from '@/types'

import { hoursAgo, minutesAgo } from './_time'

/** The lifecycle, in order. Progress bars and trackers read from this array. */
export const complaintStages: ComplaintStage[] = [
  'submitted',
  'assigned',
  'technician-assigned',
  'in-progress',
  'verification',
  'resolved',
]

/**
 * Student-facing wording for each stage. Deliberately plain: a student should
 * never have to decode facilities-management terminology to know what is
 * happening to their request.
 */
export const stageLabel: Record<ComplaintStage, string> = {
  submitted: 'Submitted',
  assigned: 'Received by campus services',
  'technician-assigned': 'Technician assigned',
  'in-progress': 'Repair in progress',
  verification: 'Waiting for your confirmation',
  resolved: 'Resolved',
}

/** Short form for chips and lists, where the full sentence will not fit. */
export const stageShortLabel: Record<ComplaintStage, string> = {
  submitted: 'Submitted',
  assigned: 'Received',
  'technician-assigned': 'Assigned',
  'in-progress': 'In progress',
  verification: 'Your confirmation',
  resolved: 'Resolved',
}

export const categoryLabel: Record<ComplaintCategory, string> = {
  hvac: 'Air conditioning & heating',
  electrical: 'Electrical',
  plumbing: 'Plumbing & water',
  furniture: 'Furniture & fittings',
  internet: 'Internet & network',
  cleanliness: 'Cleaning',
  other: 'Something else',
}

/** Compact category names for chips. */
export const categoryShortLabel: Record<ComplaintCategory, string> = {
  hvac: 'HVAC',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  furniture: 'Furniture',
  internet: 'Internet',
  cleanliness: 'Cleaning',
  other: 'Other',
}

export const priorityLabel: Record<ComplaintPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

/** What each priority actually means, shown next to the choice in the form. */
export const priorityHint: Record<ComplaintPriority, string> = {
  low: 'Inconvenient, but it can wait',
  medium: 'Affecting daily use',
  high: 'Unsafe or unusable right now',
}

export const blocks = [
  'Hostel 23',
  'Hostel 24',
  'Block 32',
  'Block 34',
  'Library',
  'Sports Complex',
]

/**
 * Demo complaints for the signed-in student. Fictional records — the UI never
 * presents these as a real institution's service history.
 */
export const complaints: Complaint[] = [
  {
    id: 'cmp_1042',
    reference: 'CMP-1042',
    title: 'Hostel AC not working',
    description:
      'The air conditioner in my room stopped cooling two days ago. It powers on and the fan runs, but no cold air comes out even on the lowest setting.',
    category: 'hvac',
    priority: 'medium',
    block: 'Hostel 23',
    room: 'Room 204',
    stage: 'in-progress',
    createdAt: hoursAgo(52),
    updatedAt: hoursAgo(4),
    photoCount: 2,
    assignee: { name: 'Suresh K.', team: 'HVAC maintenance' },
    timeline: [
      {
        stage: 'submitted',
        description: 'You reported this issue with 2 photos.',
        timestamp: hoursAgo(52),
      },
      {
        stage: 'assigned',
        description: 'Campus services received your request and routed it to HVAC maintenance.',
        timestamp: hoursAgo(49),
      },
      {
        stage: 'technician-assigned',
        description: 'Suresh K. from HVAC maintenance was assigned to your room.',
        timestamp: hoursAgo(26),
        actor: 'Suresh K.',
      },
      {
        stage: 'in-progress',
        description: 'The technician inspected the unit and is waiting on a replacement part.',
        timestamp: hoursAgo(4),
        actor: 'Suresh K.',
      },
    ],
  },
  {
    id: 'cmp_1038',
    reference: 'CMP-1038',
    title: 'Wi-Fi keeps dropping in Lab 3',
    description:
      'The network disconnects every few minutes during the Web Development lab. It affects most machines on the left side of the room.',
    category: 'internet',
    priority: 'high',
    block: 'Block 32',
    room: 'Lab 3',
    stage: 'verification',
    createdAt: hoursAgo(120),
    updatedAt: hoursAgo(20),
    photoCount: 0,
    assignee: { name: 'Network operations', team: 'IT services' },
    timeline: [
      {
        stage: 'submitted',
        description: 'You reported this issue.',
        timestamp: hoursAgo(120),
      },
      {
        stage: 'assigned',
        description: 'Campus services routed your request to IT services.',
        timestamp: hoursAgo(118),
      },
      {
        stage: 'technician-assigned',
        description: 'Network operations picked up the request.',
        timestamp: hoursAgo(96),
      },
      {
        stage: 'in-progress',
        description: 'The access point serving Lab 3 was replaced.',
        timestamp: hoursAgo(30),
      },
      {
        stage: 'verification',
        description: 'IT services asked you to confirm whether the connection is stable now.',
        timestamp: hoursAgo(20),
      },
    ],
  },
  {
    id: 'cmp_1047',
    reference: 'CMP-1047',
    title: 'Water cooler leaking on 2nd floor',
    description:
      'Water is pooling under the cooler outside Room 210. The floor stays wet through the day.',
    category: 'plumbing',
    priority: 'medium',
    block: 'Block 32',
    room: 'Floor 2 corridor',
    stage: 'submitted',
    createdAt: minutesAgo(90),
    updatedAt: minutesAgo(90),
    photoCount: 1,
    timeline: [
      {
        stage: 'submitted',
        description: 'You reported this issue with 1 photo.',
        timestamp: minutesAgo(90),
      },
    ],
  },
  {
    id: 'cmp_1021',
    reference: 'CMP-1021',
    title: 'Tube light flickering in study room',
    description: 'The light above the second desk row flickers constantly and is hard to read under.',
    category: 'electrical',
    priority: 'low',
    block: 'Library',
    room: 'Floor 2',
    stage: 'resolved',
    createdAt: hoursAgo(340),
    updatedAt: hoursAgo(196),
    photoCount: 1,
    assignee: { name: 'Electrical maintenance', team: 'Campus services' },
    timeline: [
      {
        stage: 'submitted',
        description: 'You reported this issue with 1 photo.',
        timestamp: hoursAgo(340),
      },
      {
        stage: 'assigned',
        description: 'Campus services routed your request to electrical maintenance.',
        timestamp: hoursAgo(336),
      },
      {
        stage: 'technician-assigned',
        description: 'An electrician was assigned.',
        timestamp: hoursAgo(300),
      },
      {
        stage: 'in-progress',
        description: 'The starter and tube were replaced.',
        timestamp: hoursAgo(220),
      },
      {
        stage: 'verification',
        description: 'You were asked to confirm the repair.',
        timestamp: hoursAgo(210),
      },
      {
        stage: 'resolved',
        description: 'You confirmed the light is working. This request is closed.',
        timestamp: hoursAgo(196),
      },
    ],
  },
]

export const complaintById = new Map(complaints.map((complaint) => [complaint.id, complaint]))

/**
 * Keyword hints used by the category suggestion in the report form.
 *
 * This is a deliberately simple local heuristic, not a model. The UI presents
 * it as a suggestion the student confirms — never as an automatic decision.
 */
export const categoryKeywords: Record<ComplaintCategory, string[]> = {
  hvac: ['ac', 'air conditioner', 'air conditioning', 'cooling', 'heater', 'fan', 'hot', 'stuffy'],
  electrical: ['light', 'tube', 'bulb', 'socket', 'switch', 'power', 'electric', 'wiring', 'fuse'],
  plumbing: ['water', 'tap', 'leak', 'leaking', 'drain', 'flush', 'toilet', 'pipe', 'geyser'],
  furniture: ['chair', 'desk', 'table', 'bed', 'cupboard', 'door', 'window', 'broken', 'handle'],
  internet: ['wifi', 'wi-fi', 'internet', 'network', 'lan', 'router', 'connection', 'ethernet'],
  cleanliness: ['clean', 'dirty', 'garbage', 'trash', 'dustbin', 'smell', 'washroom', 'sweep'],
  other: [],
}
