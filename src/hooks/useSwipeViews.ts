import { useEffect, useRef } from 'react'

import { haptic } from '@/lib/haptics'

/**
 * Swipe left and right to move between sibling views.
 *
 * A segmented control on a phone is only half a control — native apps let the
 * content itself be dragged between segments, and a screen that ignores a
 * horizontal flick feels inert. This attaches that gesture to a container
 * without turning it into a carousel: the views do not track the finger, the
 * flick simply commits.
 *
 * Two guards keep it from stealing gestures it has no right to:
 *
 *   - the movement must be decisively horizontal (twice the vertical), so a
 *     diagonal scroll never changes tab;
 *   - it is ignored inside anything horizontally scrollable, so swiping a
 *     week grid or a carousel scrolls it rather than navigating away.
 */
export function useSwipeViews<T extends string>({
  values,
  value,
  onChange,
  enabled = true,
}: {
  values: readonly T[]
  value: T
  onChange: (next: T) => void
  enabled?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node || !enabled) return

    let startX = 0
    let startY = 0
    let tracking = false

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return

      /* Walk up from the touch target: if anything between it and the
         container scrolls horizontally, the gesture belongs to that element. */
      let el = event.target as HTMLElement | null
      while (el && el !== node) {
        const style = window.getComputedStyle(el)
        if (
          (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
          el.scrollWidth > el.clientWidth + 1
        ) {
          return
        }
        el = el.parentElement
      }

      tracking = true
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
    }

    const onEnd = (event: TouchEvent) => {
      if (!tracking) return
      tracking = false

      const touch = event.changedTouches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY

      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 2) return

      const index = values.indexOf(value)
      const next = dx < 0 ? index + 1 : index - 1
      if (next < 0 || next >= values.length) return

      haptic('tick')
      onChange(values[next])
    }

    node.addEventListener('touchstart', onStart, { passive: true })
    node.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      node.removeEventListener('touchstart', onStart)
      node.removeEventListener('touchend', onEnd)
    }
  }, [values, value, onChange, enabled])

  return ref
}
