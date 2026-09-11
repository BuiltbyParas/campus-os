/**
 * Demo data is dated relative to whenever the app is opened, so the
 * presentation never shows stale "last week" content on demo day.
 */

export function dayOffset(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString()
}

export function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

export const TODAY = dayOffset(0)
