import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/**
 * A number that counts up to its value.
 *
 * Used only for the one or two figures a screen is *about* — an overall
 * attendance percentage, an outstanding balance. On a headline figure the count
 * draws the eye to the thing that matters and makes the value feel measured
 * rather than printed; used on every number on a page it would be noise, and
 * would make the screen feel slow.
 *
 * Respects `prefers-reduced-motion` by rendering the final value immediately.
 */
export function CountUp({
  value,
  duration = 750,
  decimals = 0,
  format,
  className,
}: {
  value: number
  duration?: number
  decimals?: number
  /** Wraps the interpolated number, e.g. for a currency or a percent sign. */
  format?: (value: number) => string
  className?: string
}) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(0)
  const frame = useRef(0)
  const from = useRef(0)

  useEffect(() => {
    /* Nothing to animate — the final value is derived during render below, so
       there is no state to push here. */
    if (reduced) return

    const start = performance.now()
    const origin = from.current
    const delta = value - origin

    function tick(now: number) {
      const elapsed = Math.min(1, (now - start) / duration)
      /* Ease-out cubic: most of the distance early, settling gently — the
         value should arrive, not decelerate forever. */
      const eased = 1 - Math.pow(1 - elapsed, 3)
      setDisplay(origin + delta * eased)
      if (elapsed < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        from.current = value
      }
    }

    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value, duration, reduced])

  /* Derived, not stored: under reduced motion the value is simply the value. */
  const shown = reduced ? value : display
  const rounded = decimals > 0 ? shown.toFixed(decimals) : String(Math.round(shown))

  return (
    <span className={className} aria-label={format ? format(value) : undefined}>
      {format ? format(Number(rounded)) : rounded}
    </span>
  )
}
