import { modules } from '@/data/landing'

import { Container, Reveal, SectionHeading } from './primitives'

/**
 * The eight modules. Rendered as one hairline grid rather than eight floating
 * cards — it reads as a single system, which is the point of the product.
 */
export function PlatformSection() {
  return (
    <section id="platform" className="relative scroll-mt-24 py-24 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The platform"
            title="Eight surfaces. One continuous system."
            description="Each module stands on its own, but they share one identity, one data layer and one set of interactions — so nothing has to be learned twice."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-14 overflow-hidden rounded-2xl border border-line bg-line">
            <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
              {modules.map(({ name, description, icon: Icon }) => (
                <div
                  key={name}
                  className="group relative bg-canvas p-6 transition-colors duration-300 hover:bg-surface"
                >
                  <Icon
                    className="size-[18px] text-ink-subtle transition-colors duration-300 group-hover:text-brand-ink"
                    aria-hidden
                  />
                  <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-ink">{name}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
