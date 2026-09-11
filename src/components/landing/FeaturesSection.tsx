import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { features } from '@/data/landing'
import { cn } from '@/lib/utils'

import { Container, Glow, Reveal, SectionHeading } from './primitives'

const toneStyles = {
  danger: { pill: 'bg-danger-soft text-danger-ink', value: 'text-danger-ink' },
  warn: { pill: 'bg-warn-soft text-warn-ink', value: 'text-ink' },
  brand: { pill: 'bg-brand-soft text-brand-ink', value: 'text-ink' },
} as const

/**
 * The three MVP capabilities, each shown next to the actual record the product
 * would display. The sample is labelled demo data — the page never implies
 * these are live institutional figures.
 */
export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative scroll-mt-24 overflow-hidden border-y border-line bg-surface-muted/40 py-24 sm:py-28 lg:py-32"
    >
      <Glow className="left-1/2 top-0 h-[320px] w-[620px] -translate-x-1/2 opacity-40" />

      <Container className="relative">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Features"
            title="Built around the day a student actually has."
            description="Not a portal with more tabs. A system that knows what is next, what is at risk, and what is still waiting on someone else."
          />
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-3">
          {features.map((feature, index) => {
            const tone = toneStyles[feature.sample.tone]

            return (
              <Reveal key={feature.title} delay={index * 0.08} className="h-full">
                <div className="flex h-full flex-col bg-canvas p-7 sm:p-8">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                    {feature.eyebrow}
                  </span>

                  <h3 className="mt-4 text-[19px] font-semibold leading-snug tracking-tight text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-muted">
                    {feature.description}
                  </p>

                  {/* the real record, as the product would show it */}
                  <div className="mt-7 rounded-tile border border-line bg-surface p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-medium',
                          tone.pill,
                        )}
                      >
                        {feature.sample.statusLabel}
                      </span>
                      <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
                        Demo
                      </span>
                    </div>

                    <p
                      className={cn(
                        'mt-3 text-[17px] font-semibold leading-tight tracking-tight',
                        tone.value,
                      )}
                    >
                      {feature.sample.primary}
                    </p>
                    <p className="mt-1 text-[12.5px] text-ink-muted">{feature.sample.secondary}</p>
                    {feature.sample.meta ? (
                      <p className="mt-2 border-t border-line pt-2 text-[11.5px] text-ink-subtle">
                        {feature.sample.meta}
                      </p>
                    ) : null}
                  </div>

                  <Link
                    to={feature.action.to}
                    className="group mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink transition-colors hover:text-ink"
                  >
                    {feature.action.label}
                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
