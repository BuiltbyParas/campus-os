import { useCallback, useRef, type CSSProperties } from 'react'

import { useFinePointer, useReducedMotionPreference } from './useMediaQuery'

export interface TiltOptions {
  /** Maximum rotation on each axis, in degrees. */
  max?: number
  /** How far the card rises while the pointer is over it, in pixels. */
  lift?: number
}

/**
 * Pointer-tracked 3D tilt.
 *
 * The card leans towards the cursor, which is what makes a flat rectangle read
 * as a physical object sitting above the page. Three rules keep it from
 * becoming a gimmick:
 *
 *   - it is *small* (a couple of degrees) — past about 6° it stops reading as
 *     depth and starts reading as a novelty;
 *   - it only runs for a fine pointer, so a phone never fights a thumb drag
 *     for control of a transform;
 *   - it is off entirely under `prefers-reduced-motion`.
 *
 * The values are written to CSS custom properties rather than to React state.
 * A pointer move would otherwise re-render the subtree on every frame; this
 * way the browser animates one composited transform and React does nothing.
 */
export function useTilt({ max = 3, lift = 6 }: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const reduced = useReducedMotionPreference()
  const enabled = fine && !reduced

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = ref.current
      if (!node || !enabled) return

      const rect = node.getBoundingClientRect()
      /* -0.5 … 0.5 from the centre of the card. */
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5

      /* Y rotation follows the horizontal axis and X is inverted, which is
         what makes the card appear to lean *towards* the cursor rather than
         away from it. */
      node.style.setProperty('--tilt-y', `${(px * max * 2).toFixed(2)}deg`)
      node.style.setProperty('--tilt-x', `${(-py * max * 2).toFixed(2)}deg`)
      node.style.setProperty('--tilt-lift', `${-lift}px`)
    },
    [enabled, max, lift],
  )

  const reset = useCallback(() => {
    const node = ref.current
    if (!node) return
    node.style.setProperty('--tilt-x', '0deg')
    node.style.setProperty('--tilt-y', '0deg')
    node.style.setProperty('--tilt-lift', '0px')
  }, [])

  return {
    ref,
    /** Spread onto the element that should tilt. */
    tiltProps: enabled
      ? { onPointerMove, onPointerLeave: reset, onBlur: reset }
      : {},
    /** True when the effect is actually running, for conditional chrome. */
    enabled,
    style: undefined as CSSProperties | undefined,
  }
}
