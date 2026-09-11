import { CtaSection } from '@/components/landing/CtaSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { Hero } from '@/components/landing/Hero'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { PlatformSection } from '@/components/landing/PlatformSection'
import { LandingLayout } from '@/layouts/LandingLayout'

export default function Landing() {
  return (
    <LandingLayout>
      <Hero />
      <PlatformSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </LandingLayout>
  )
}
