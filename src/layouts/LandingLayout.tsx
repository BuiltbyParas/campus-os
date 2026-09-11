import type { ReactNode } from 'react'

import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

/**
 * Shell for every public, pre-login screen.
 *
 * `dark` is applied here rather than on <html> so the marketing surface keeps
 * its intended palette even when a signed-in student has chosen light mode for
 * the app itself. `landing-surface` lets the root element paint the same canvas
 * (see index.css) so overscroll never reveals a light background.
 */
export function LandingLayout({
  children,
  chrome = true,
}: {
  children: ReactNode
  chrome?: boolean
}) {
  return (
    <div className="landing-surface dark min-h-dvh overflow-x-clip bg-canvas text-ink antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-brand"
      >
        Skip to content
      </a>

      {chrome ? <LandingNav /> : null}
      <main id="main">{children}</main>
      {chrome ? <LandingFooter /> : null}
    </div>
  )
}
