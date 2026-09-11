/**
 * Demo data barrel.
 *
 * Everything exported here is fictional and exists only so the interface can be
 * evaluated end to end. When the backend lands, `src/services/*` swaps these
 * fallbacks for API responses — no component imports this module directly for
 * anything it renders as fact.
 */

export { dayOffset, hoursAgo, minutesAgo, TODAY } from './_time'
export { demoStudent } from './student'
export { courses, courseById, courseName } from './courses'
export { attendanceSummary, DEMO_REQUIRED_PERCENTAGE } from './attendance'
export {
  timetable,
  weekdays,
  weekdayLabel,
  weekdayShort,
  sessionKindLabel,
} from './timetable'
export {
  complaints,
  complaintById,
  complaintStages,
  stageLabel,
  stageShortLabel,
  categoryLabel,
  categoryShortLabel,
  categoryKeywords,
  priorityLabel,
  priorityHint,
  blocks,
} from './complaints'
export { events, eventById, eventCategoryLabel } from './events'
export { notifications } from './notifications'
export { assistantSuggestions } from './assistant'
