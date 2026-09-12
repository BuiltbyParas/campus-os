/**
 * Haptic feedback.
 *
 * A tap that answers with a tick feels like a control; the same tap in
 * silence feels like a web page. The vocabulary is deliberately tiny — three
 * weights, named for what they mean rather than for their duration, so call
 * sites never invent their own patterns.
 *
 * Support is uneven and that is fine: `navigator.vibrate` is a no-op on
 * desktop and unimplemented in iOS Safari, so this degrades to nothing
 * rather than to something broken. It must never be the only feedback an
 * interaction gives.
 */

type Pattern = 'tick' | 'select' | 'success' | 'warn'

const patterns: Record<Pattern, number | number[]> = {
  /** A selection moved — a tab, a segment, a filter chip. */
  tick: 8,
  /** Something was committed — a toggle, a submit. */
  select: 14,
  /** A gesture reached its threshold, or an action completed. */
  success: [10, 40, 18],
  /** Something needs a second look before it is confirmed. */
  warn: [16, 60, 16],
}

let enabled = true

/** Settings can silence this without every call site knowing. */
export function setHapticsEnabled(next: boolean) {
  enabled = next
}

export function haptic(pattern: Pattern = 'tick') {
  if (!enabled) return
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return

  /* A vibration is an interruption, so it is skipped entirely for anyone who
     has asked the system to reduce motion. */
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    navigator.vibrate(patterns[pattern])
  } catch {
    /* Some browsers throw when the document is not focused. Feedback is never
       important enough to interrupt what the user was doing. */
  }
}
