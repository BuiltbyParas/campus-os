import { useEffect, useRef } from 'react'

import { useReducedMotionPreference } from '@/hooks/useMediaQuery'

/**
 * The environment the glass layers pick their colour up from.
 *
 * Three blurred orbs drifting on long cycles, plus a noise layer. Without
 * them the dark canvas is flat grey and every "glass" surface in the product
 * reads as a plain dark box, because there is nothing behind it to bleed
 * through.
 *
 * It is `fixed` and `aria-hidden`, costs no layout, and takes no pointer
 * events. The parallax is written to a custom property on scroll rather than
 * to state — the alternative is a React render on every scroll frame.
 */
export function AmbientBackdrop() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotionPreference()

  useEffect(() => {
    if (reduced) return
    const node = ref.current
    if (!node) return

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        /* A quarter of the scroll distance: enough to feel like depth, not
           enough to read as the background sliding around. */
        node.style.setProperty('--parallax', `${window.scrollY * -0.25}px`)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reduced])

  return (
    <div
      ref={ref}
      aria-hidden
      className="noise pointer-events-none fixed inset-0 overflow-hidden"
      style={{ transform: 'translateY(var(--parallax, 0px))' }}
    >
      <div className="orb animate-orb -left-40 -top-48 size-[620px] bg-brand/[0.16]" />
      <div className="orb animate-orb-slow -right-48 top-1/3 size-[560px] bg-accent-cyan/[0.08]" />
      <div className="orb animate-orb bottom-[-12rem] left-1/3 size-[520px] bg-accent-violet/[0.09]" />
    </div>
  )
}
