import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'

import { IntelligenceCore } from '@/components/core/IntelligenceCore'
import { Container, Reveal, SectionHeading } from './primitives'

const FRAGMENTS = [
  { label: 'Attendance', detail: 'A portal you log into', x: '-34%', y: '-20%' },
  { label: 'Timetable', detail: 'A PDF on a noticeboard', x: '30%', y: '-28%' },
  { label: 'Complaints', detail: 'A register at the desk', x: '-40%', y: '20%' },
  { label: 'Notices', detail: 'A group chat', x: '36%', y: '14%' },
  { label: 'Events', detail: 'An Instagram post', x: '-6%', y: '36%' },
]

/**
 * The argument, made by scrolling.
 *
 * The section states the problem — five services a student holds in their head
 * separately — and then converges them into one core as it scrolls. The motion
 * *is* the claim rather than decoration, so under reduced motion the same point
 * is made by the copy plus the core's resolved final state.
 */
export function UnificationSection() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [converge, setConverge] = useState(0)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  })

  const convergeValue = useTransform(scrollYProgress, [0.15, 0.85], [0, 1])
  const fragmentOpacity = useTransform(scrollYProgress, [0.1, 0.6], [1, 0])
  const fragmentScale = useTransform(scrollYProgress, [0.1, 0.8], [1, 0.74])

  /* The core takes a plain number, so mirror the motion value into state.
     Rounding to two decimals keeps this to a handful of renders per scroll
     rather than one per frame. */
  useMotionValueEvent(convergeValue, 'change', (latest) => {
    setConverge(Math.round(latest * 50) / 50)
  })

  return (
    <section
      ref={ref}
      id="problem"
      className="relative scroll-mt-24 overflow-hidden py-24 sm:py-28 lg:py-32"
    >
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The problem"
            title={
              <>
                Your campus is connected.
                <br className="hidden sm:block" /> Your experience isn’t.
              </>
            }
            description="Attendance lives in one portal, the timetable in another, complaints at a desk, notices in a group chat. Nothing is missing — it is just scattered across five places that never speak to each other."
          />
        </Reveal>

        <div className="relative mt-16 grid place-items-center">
          {/* the scattered state, which recedes as the section scrolls */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 hidden sm:block"
            style={reduced ? { opacity: 0 } : { opacity: fragmentOpacity, scale: fragmentScale }}
            aria-hidden
          >
            {FRAGMENTS.map((fragment) => (
              <div
                key={fragment.label}
                className="absolute left-1/2 top-1/2 w-[164px] rounded-xl border border-line bg-surface/85 p-3"
                style={{
                  transform: `translate(calc(-50% + ${fragment.x}), calc(-50% + ${fragment.y}))`,
                }}
              >
                <p className="text-[12.5px] font-medium text-ink">{fragment.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-subtle">{fragment.detail}</p>
              </div>
            ))}
          </motion.div>

          <IntelligenceCore converge={reduced ? 1 : converge} />
        </div>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-14 max-w-xl text-center text-[15px] leading-relaxed text-ink-muted">
            CampusOS does not add a sixth place to check. It sits underneath the five that already
            exist and answers one question instead:{' '}
            <span className="font-medium text-ink">what do you need right now?</span>
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
