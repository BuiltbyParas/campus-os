/**
 * Demo data is dated relative to whenever the app is opened, so the
 * presentation never shows stale "last week" content on demo day.
 */

/**
 * A calendar date in the *viewer's* timezone, as YYYY-MM-DD.
 *
 * `toISOString()` cannot be used for this. It returns a UTC date, so anywhere
 * east of UTC — all of India — every record dated "today" between midnight and
 * the UTC offset would be tagged as yesterday and silently disappear from the
 * Today view. Every date string in CampusOS is a local calendar date, and this
 * is the single place that decides what that means.
 */
export function toLocalIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function dayOffset(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toLocalIsoDate(date)
}

export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString()
}

export function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

export const TODAY = dayOffset(0)
