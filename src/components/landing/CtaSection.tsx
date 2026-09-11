import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Container, Glow, Reveal } from './primitives'

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center shadow-e3 edge-highlight sm:px-12 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-mesh opacity-40 mask-fade-b" />
              <Glow className="left-1/2 top-[-120px] h-[320px] w-[560px] -translate-x-1/2" />
            </div>

            <div className="relative">
              <h2 className="mx-auto max-w-[620px] text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink sm:text-[42px]">
                Your campus is already running.
                <br className="hidden sm:block" /> Give it an interface.
              </h2>
              <p className="mx-auto mt-5 max-w-[460px] text-[15px] leading-relaxed text-ink-muted">
                Open the demo workspace and move through the student experience end to end.
              </p>

              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/app"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-control bg-brand px-6 text-[15px] font-medium text-on-brand shadow-[0_0_0_1px_var(--brand-border),0_14px_40px_-14px_var(--brand)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-brand-hover active:scale-[0.98]"
                >
                  Enter CampusOS
                  <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center justify-center rounded-control border border-line bg-canvas/40 px-6 text-[15px] font-medium text-ink transition-colors duration-200 hover:border-line-strong"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
