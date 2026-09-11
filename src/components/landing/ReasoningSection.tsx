import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowDown, CalendarDays, ScanLine, ShieldQuestion, Sparkles } from 'lucide-react'
import { useRef } from 'react'

import { easeOutSoft } from '@/lib/motion'
import { cn } from '@/lib/utils'

import { Container, Glow, Reveal, SectionHeading } from './primitives'

/** The records the assistant pulls before it answers. */
const RETRIEVED = [
  { icon: ScanLine, label: 'Attendance', value: 'DBMS · 72%', tone: 'danger' as const },
  { icon: CalendarDays, label: 'Timetable', value: '1 DBMS class tomorrow', tone: 'info' as const },
  { icon: ShieldQuestion, label: 'Demo policy', value: '75% threshold', tone: 'warn' as const },
]

const toneRing = {
  danger: 'border-danger/30 bg-danger-soft/25',
  info: 'border-line bg-surface',
  warn: 'border-warn/30 bg-warn-soft/25',
}

/**
 * The AI section, staged as the four beats it actually performs:
 * question → retrieval → understanding → answer.
 *
 * The retrieval step is the whole difference between this and a chatbot, so it
 * gets its own beat on screen rather than hiding behind a spinner.
 */
export function ReasoningSection() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-120px' })

  const step = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: inView ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.5, ease: easeOutSoft, delay },
        }

  return (
    <section
      id="assistant"
      className="relative scroll-mt-24 overflow-hidden border-y border-line bg-surface-muted/40 py-24 sm:py-28 lg:py-32"
    >
      <Glow className="left-1/2 top-10 h-[300px] w-[560px] -translate-x-1/2 opacity-40" />

      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow="The assistant"
            title={
              <>
                It doesn’t just answer.
                <br className="hidden sm:block" /> It understands context.
              </>
            }
            description="Ask a question the way you would ask a friend. CampusOS reads your own records first, then shows you exactly which ones it used."
          />
        </Reveal>

        <div ref={ref} className="mx-auto mt-14 max-w-[640px]">
          {/* 1 — the question */}
          <motion.div {...step(0)} className="flex justify-end">
            <p className="max-w-[80%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[14.5px] text-on-brand">
              Can I skip tomorrow’s DBMS?
            </p>
          </motion.div>

          {/* 2 — retrieval */}
          <motion.div {...step(0.35)} className="mt-6">
            <p className="mb-3 text-center text-[11.5px] font-medium uppercase tracking-[0.14em] text-ink-subtle">
              Checking your records
            </p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {RETRIEVED.map((record, i) => (
                <motion.div
                  key={record.label}
                  {...step(0.45 + i * 0.12)}
                  className={cn('rounded-tile border px-3.5 py-3', toneRing[record.tone])}
                >
                  <div className="flex items-center gap-2">
                    <record.icon className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
                    <p className="text-[11.5px] text-ink-subtle">{record.label}</p>
                  </div>
                  <p className="mt-1.5 text-[13px] font-medium text-ink">{record.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 3 — the join */}
          <motion.div {...step(0.85)} className="my-5 flex justify-center" aria-hidden>
            <ArrowDown className="size-4 text-ink-subtle" />
          </motion.div>

          {/* 4 — the answer */}
          <motion.div {...step(1)} className="flex gap-3">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft">
              <Sparkles className="size-3.5 text-brand-ink" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-line bg-surface p-4">
              <p className="text-[14.5px] leading-relaxed text-ink">
                I wouldn’t recommend it. You’re at 72% in Database Management Systems, below the 75%
                demo threshold. Missing tomorrow’s class takes you to 69%.
              </p>

              <div className="mt-4 border-t border-line pt-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-subtle">
                  Based on
                </p>
                <ul className="flex flex-wrap gap-2">
                  {['Attendance', 'Timetable', 'Demo policy'].map((source) => (
                    <li
                      key={source}
                      className="inline-flex items-center gap-1.5 rounded border border-line px-2 py-1 text-[11.5px] text-ink-muted"
                    >
                      {source}
                      <span className="rounded bg-surface-muted px-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
                        Demo
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.p {...step(1.15)} className="mt-5 text-center text-[12.5px] text-ink-subtle">
            CampusOS never states a university policy as fact. Demo rules are labelled as demo.
          </motion.p>
        </div>
      </Container>
    </section>
  )
}
