import { Camera, Check, Send, Sparkles, Wrench } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Container, Reveal, SectionHeading } from './primitives'

const STEPS = [
  {
    icon: Camera,
    label: 'Photo',
    title: 'Point at the problem',
    detail: 'A photo of the hostel AC is the whole input.',
  },
  {
    icon: Sparkles,
    label: 'Classified',
    title: 'CampusOS reads it',
    detail: 'Air conditioning · HVAC · medium priority, at 92% confidence.',
  },
  {
    icon: Check,
    label: 'Confirmed',
    title: 'You approve it',
    detail: 'Category, priority and location are suggestions until you say so.',
  },
  {
    icon: Send,
    label: 'Submitted',
    title: 'Routed automatically',
    detail: 'CMP-1042 opens with the right team already attached.',
  },
  {
    icon: Wrench,
    label: 'Tracked',
    title: 'Followed to the end',
    detail: 'Every stage through to your confirmation that it is fixed.',
  },
]

/**
 * The complaint workflow as one continuous process.
 *
 * A horizontal rail rather than five cards, because the point is that these are
 * one motion — photo to resolution — not five separate things a student has to
 * chase. The rail scrolls on narrow screens instead of wrapping, so the
 * sequence never breaks into a grid.
 */
export function ComplaintFlowSection() {
  return (
    <section id="complaints" className="relative scroll-mt-24 py-24 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Campus services"
            title="A photo in. A resolution out."
            description="Reporting something broken should take thirty seconds and then keep you informed without you asking again."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-14 overflow-x-auto pb-2 scrollbar-none">
            <ol className="flex min-w-[860px] items-stretch gap-0">
              {STEPS.map((step, index) => (
                <li key={step.label} className="relative flex-1">
                  {/* connector */}
                  {index < STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-[22px] h-px bg-gradient-to-r from-brand/40 to-line"
                    />
                  ) : null}

                  <div className="relative flex flex-col items-center px-3 text-center">
                    <span
                      className={cn(
                        'relative z-10 grid size-11 place-items-center rounded-full border',
                        index === 1
                          ? 'border-brand-border/60 bg-brand-soft text-brand-ink'
                          : 'border-line bg-surface text-ink-subtle',
                      )}
                    >
                      <step.icon className="size-[18px]" aria-hidden />
                    </span>

                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                      {step.label}
                    </p>
                    <p className="mt-2 text-[14.5px] font-medium leading-snug text-ink">
                      {step.title}
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-10 text-center text-[12.5px] text-ink-subtle">
            The classifier in this prototype is a demo stub. Nothing is submitted until you confirm
            what it suggested.
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
