import { categoryKeywords, complaints, complaintStages, stageLabel } from '@/data'
import { uid } from '@/lib/utils'
import type { Complaint, ComplaintCategory, ComplaintDraft } from '@/types'

import { mutate, request } from './http'

/** Complaints created during this session, so the demo reflects what you file. */
const sessionComplaints: Complaint[] = []

export interface ComplaintFilters {
  /** `open` hides resolved requests — the default view a student wants. */
  status?: 'all' | 'open' | 'resolved'
}

function applyFilters(list: Complaint[], filters: ComplaintFilters) {
  if (!filters.status || filters.status === 'all') return list
  return list.filter((complaint) =>
    filters.status === 'resolved'
      ? complaint.stage === 'resolved'
      : complaint.stage !== 'resolved',
  )
}

export function listComplaints(filters: ComplaintFilters = {}): Promise<Complaint[]> {
  return request(`/complaints?status=${filters.status ?? 'all'}`, () => {
    const all = [...sessionComplaints, ...complaints].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    return applyFilters(all, filters)
  })
}

export function getComplaint(id: string): Promise<Complaint | undefined> {
  return request(`/complaints/${id}`, () =>
    [...sessionComplaints, ...complaints].find((complaint) => complaint.id === id),
  )
}

/**
 * A local keyword heuristic that proposes a category from what the student
 * typed. It is a *suggestion*: the form pre-selects it and says where it came
 * from, and the student can override it before submitting.
 */
export function suggestCategory(text: string): {
  category: ComplaintCategory
  confident: boolean
  matched: string | null
} {
  const haystack = text.toLowerCase()
  let best: { category: ComplaintCategory; keyword: string } | null = null

  for (const [category, keywords] of Object.entries(categoryKeywords) as [
    ComplaintCategory,
    string[],
  ][]) {
    for (const keyword of keywords) {
      // Longest match wins, so "air conditioner" beats a stray "ac".
      const matches = new RegExp(`\\b${keyword}\\b`).test(haystack)
      if (matches && (!best || keyword.length > best.keyword.length)) {
        best = { category, keyword }
      }
    }
  }

  if (!best) return { category: 'other', confident: false, matched: null }
  return { category: best.category, confident: true, matched: best.keyword }
}

let nextReference = 1048

/** Creates a complaint. Optimistic in demo mode so the tracker has something real to show. */
export function createComplaint(draft: ComplaintDraft): Promise<Complaint> {
  return mutate('/complaints', draft, () => {
    const now = new Date().toISOString()
    const reference = `CMP-${nextReference++}`

    const complaint: Complaint = {
      id: uid('cmp'),
      reference,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      priority: draft.priority,
      block: draft.block,
      room: draft.room,
      stage: 'submitted',
      createdAt: now,
      updatedAt: now,
      photoCount: draft.photoCount,
      timeline: [
        {
          stage: 'submitted',
          description:
            draft.photoCount > 0
              ? `You reported this issue with ${draft.photoCount} photo${draft.photoCount === 1 ? '' : 's'}.`
              : 'You reported this issue.',
          timestamp: now,
        },
      ],
    }

    sessionComplaints.unshift(complaint)
    return complaint
  })
}

/** How far through the lifecycle a complaint is, as a 0–1 fraction. */
export function stageProgress(complaint: Complaint) {
  const index = complaintStages.indexOf(complaint.stage)
  return (index + 1) / complaintStages.length
}

export function currentStageLabel(complaint: Complaint) {
  return stageLabel[complaint.stage]
}
