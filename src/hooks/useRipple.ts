import { useCallback, useRef } from 'react'

import { useReducedMotionPreference } from './useMediaQuery'

/**
 * Material-style click ripple, spreading from the point pressed.
 *
 * The ripple is a DOM node appended directly and removed on animation end
 * rather than a piece of React state: it is pure feedback with no bearing on
 * what the component renders, and keeping it out of the tree means a rapid
 * series of clicks cannot queue re-renders.
 *
 * The host element needs `.ripple-host` (position + overflow clip) so the
 * circle is bounded by the control's own shape.
 */
export function useRipple<T extends HTMLElement = HTMLButtonElement>() {
  const ref = useRef<T>(null)
  const reduced = useReducedMotionPreference()

  const spawn = useCallback(
    (event: React.PointerEvent<T>) => {
      const host = ref.current
      if (!host || reduced) return

      const rect = host.getBoundingClientRect()
      /* Large enough to reach the far corner from wherever it started. */
      const size = Math.hypot(rect.width, rect.height) * 2

      const ink = document.createElement('span')
      ink.className = 'ripple-ink'
      ink.style.width = `${size}px`
      ink.style.height = `${size}px`
      ink.style.left = `${event.clientX - rect.left}px`
      ink.style.top = `${event.clientY - rect.top}px`
      ink.addEventListener('animationend', () => ink.remove(), { once: true })
      host.appendChild(ink)
    },
    [reduced],
  )

  return { ref, rippleProps: { onPointerDown: spawn } }
}
