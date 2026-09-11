import type { Transition, Variants } from 'framer-motion'

/**
 * Shared motion vocabulary. Every animation in the app pulls from here so the
 * whole product moves with one personality — quick, soft, never showy.
 */

export const easeOutSoft: Transition['ease'] = [0.22, 1, 0.36, 1]

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOutSoft } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.16, ease: 'easeIn' } },
}

export const listContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.045, delayChildren: 0.02 } },
}

export const listItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOutSoft } },
}

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: easeOutSoft } },
  exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: 0.14 } },
}

export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
}

export const sheetUp: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: { duration: 0.3, ease: easeOutSoft } },
  exit: { y: '100%', transition: { duration: 0.2, ease: 'easeIn' } },
}

/** Press feedback shared by buttons and tappable cards. */
export const pressable = {
  whileTap: { scale: 0.975 },
  transition: { duration: 0.12, ease: easeOutSoft },
}
