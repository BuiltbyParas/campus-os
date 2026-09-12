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

/* -------------------------------------------------------------- premium */

/** The brief's easing set, as framer-motion tuples. */
export const easePremium: Transition['ease'] = [0.34, 1.56, 0.64, 1]
export const easeElegant: Transition['ease'] = [0.2, 0.9, 0.1, 1]

/**
 * Page-load reveal.
 *
 * Blocks rise and fade in sequence rather than all at once, which is what
 * makes a dense screen read as being *composed* rather than dumped. The
 * stagger is 60ms — long enough to perceive as order, short enough that the
 * last card is on screen well inside a third of a second.
 */
export const revealContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

export const revealItem: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.2, 0.9, 0.1, 1] },
  },
}
