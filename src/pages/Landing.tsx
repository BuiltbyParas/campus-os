import { ComplaintFlowSection } from '@/components/landing/ComplaintFlowSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { Hero } from '@/components/landing/Hero'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { PlatformSection } from '@/components/landing/PlatformSection'
import { PulseSection } from '@/components/landing/PulseSection'
import { ReasoningSection } from '@/components/landing/ReasoningSection'
import { UnificationSection } from '@/components/landing/UnificationSection'
import { YourDaySection } from '@/components/landing/YourDaySection'
import { LandingLayout } from '@/layouts/LandingLayout'

/**
 * The landing page is a single argument told in order:
 *
 *   hero          — the claim
 *   problem       — why it is needed, shown by fragments converging
 *   your day      — what "one system" produces
 *   assistant     — how context becomes an answer
 *   complaints    — the same intelligence applied to campus services
 *   pulse         — what you would otherwise miss
 *   platform      — the full surface area
 *   how it works  — getting started
 *   cta           — the way in
 *
 * Each section carries one idea. The order is the story.
 */
export default function Landing() {
  return (
    <LandingLayout>
      <Hero />
      <UnificationSection />
      <YourDaySection />
      <ReasoningSection />
      <ComplaintFlowSection />
      <PulseSection />
      <PlatformSection />
      <HowItWorksSection />
      <CtaSection />
    </LandingLayout>
  )
}
