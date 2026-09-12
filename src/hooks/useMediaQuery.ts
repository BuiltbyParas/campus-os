import { useSyncExternalStore } from 'react'

/**
 * A media query as reactive state.
 *
 * `useSyncExternalStore` rather than an effect + state pair: the value is
 * already external, so subscribing to it directly means no first render with a
 * wrong answer and no extra paint when it settles.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    /* Server/first-paint fallback. False is the conservative answer for every
       query we ask: no fine pointer, no reduced motion, not a wide screen. */
    () => false,
  )
}

/** True on a device that can hover with a precise pointer — a mouse, not a thumb. */
export function useFinePointer() {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}

/** True when the visitor has asked the system for less motion. */
export function useReducedMotionPreference() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
