import { steps } from '@/data/landing'

import { Container, Reveal, SectionHeading } from './primitives'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 py-24 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Three steps, then it stays out of the way."
          />
        </Reveal>

        <ol className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {/* the rail that connects the three steps on desktop */}
          <div
            aria-hidden
            className="absolute left-5 right-[16.7%] top-[19px] hidden h-px bg-gradient-to-r from-line-strong to-transparent md:block"
          />

          {steps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 0.1} className="relative md:pr-8">
              <span className="relative z-10 grid size-10 place-items-center rounded-full border border-line-strong bg-surface text-[13px] font-semibold tabular-nums text-brand-ink shadow-e2">
                {index + 1}
              </span>
              <h3 className="mt-6 text-[17px] font-semibold tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2.5 max-w-sm text-[14px] leading-relaxed text-ink-muted">
                {step.description}
              </p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}
