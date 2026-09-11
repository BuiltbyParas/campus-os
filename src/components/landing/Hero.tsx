import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { hero } from '@/data/landing'
import { easeOutSoft } from '@/lib/motion'

import { DashboardPreview } from './DashboardPreview'
import { FloatingBadges } from './FloatingBadges'
import { IntelligenceCore } from '@/components/core/IntelligenceCore'
import { Container, Glow } from './primitives'

export function Hero() {
  const reduced = useReducedMotion()

  /** Sequenced entrance: eyebrow → headline → subtitle → actions → preview. */
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: easeOutSoft, delay },
        }

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-40">
      {/* ---------------------------------------------------- ambient light */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[620px] bg-mesh mask-fade-radial opacity-70" />
        <Glow className="left-1/2 top-[-160px] h-[420px] w-[760px] -translate-x-1/2 opacity-80" />
        <Glow
          color="info"
          className="left-[12%] top-[280px] h-[360px] w-[420px] opacity-60"
        />
        <Glow className="right-[8%] top-[360px] h-[380px] w-[420px] opacity-50" />
      </div>

      <Container>
        {/* ------------------------------------------------------- headline */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div {...rise(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-muted backdrop-blur-sm">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-brand opacity-60 [animation:pulse-ring_2.4s_ease-out_infinite]" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
              </span>
              {hero.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="mt-7 text-[38px] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[56px] lg:text-[68px]"
          >
            <span className="block text-gradient">{hero.headline[0]}</span>
            <span className="block text-gradient-brand">{hero.headline[1]}</span>
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mx-auto mt-6 max-w-[600px] text-[15px] leading-relaxed text-ink-muted sm:text-[17px]"
          >
            {hero.subtitle}
          </motion.p>

          {/* --------------------------------------------------------- CTAs */}
          <motion.div
            {...rise(0.24)}
            className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <Link
              to={hero.primaryCta.to}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-control bg-brand px-6 text-[15px] font-medium text-on-brand shadow-[0_0_0_1px_var(--brand-border),0_14px_40px_-14px_var(--brand)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-brand-hover hover:shadow-[0_0_0_1px_var(--brand-border),0_18px_48px_-12px_var(--brand)] active:scale-[0.98]"
            >
              {hero.primaryCta.label}
              <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <a
              href={hero.secondaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-control border border-line bg-surface/50 px-6 text-[15px] font-medium text-ink backdrop-blur-sm transition-[background-color,border-color] duration-200 hover:border-line-strong hover:bg-surface"
            >
              {hero.secondaryCta.label}
            </a>
          </motion.div>
        </div>

        {/* ------------------------------------------------ intelligence core */}
        <motion.div
          {...(reduced
            ? {}
            : {
                initial: { opacity: 0, scale: 0.94 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.9, ease: easeOutSoft, delay: 0.3 },
              })}
          className="mt-10 sm:mt-14"
        >
          <IntelligenceCore />
          <p className="mx-auto mt-2 max-w-sm text-center text-[12.5px] text-ink-subtle">
            Five campus services, one intelligent layer.
          </p>
        </motion.div>

        {/* -------------------------------------------------- product preview */}
        <motion.div
          {...(reduced
            ? {}
            : {
                initial: { opacity: 0, y: 40 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, ease: easeOutSoft, delay: 0.34 },
              })}
          className="relative mx-auto mt-14 max-w-[960px] sm:mt-16"
        >
          {/* light pooled behind the glass */}
          <Glow
            className="inset-x-10 -top-10 h-[300px] opacity-90 blur-[120px]"
            aria-hidden
          />
          <FloatingBadges />
          <div className="relative z-10">
            <DashboardPreview />
          </div>
        </motion.div>
      </Container>

      {/* the preview dissolves into the next section rather than stopping */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-canvas"
      />
    </section>
  )
}
