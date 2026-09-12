import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'

import { CommandPalette } from '@/components/app/CommandPalette'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { pageTransition } from '@/lib/motion'

import { AmbientBackdrop } from './AmbientBackdrop'
import { AssistantLauncher } from './AssistantLauncher'
import { BottomNav } from './BottomNav'
import { DemoModeBanner } from './DemoModeBanner'
import { MobileHeader } from './MobileHeader'
import { QuickStats } from './QuickStats'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

function useScrollToTopOnNavigate() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
}

/**
 * The signed-in workspace.
 *
 * `app-surface` is the whole reason the premium palette can exist without
 * touching the marketing page: every token in the enterprise scheme is defined
 * against that class, so it reaches this subtree and nothing else. The landing
 * page keeps its own frozen palette through `.landing-surface`, and neither
 * scope can see the other's values.
 *
 * The scope carries no `dark` class of its own. The theme provider owns that
 * on the root element, and the premium palette is defined for both themes —
 * so the appearance control in Settings and the toggle in the top bar change
 * what is on screen instead of being decoration.
 */
export function AppShell() {
  const location = useLocation()
  const reduced = useReducedMotion()
  const palette = useCommandPalette()
  useScrollToTopOnNavigate()

  return (
    <div className="app-surface relative min-h-dvh bg-canvas text-ink antialiased">
      <AmbientBackdrop />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-control focus:bg-brand focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-on-brand"
      >
        Skip to content
      </a>

      <Sidebar onOpenCommandPalette={palette.toggle} />
      <MobileHeader onOpenCommandPalette={palette.toggle} />

      <div className="relative md:pl-[90px] lg:pl-[280px]">
        <TopBar onOpenCommandPalette={palette.toggle} />
        <QuickStats />
        <DemoModeBanner />

        <main id="main" className="pb-32 pt-5 sm:pt-6 lg:pb-24 lg:pt-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={reduced ? undefined : pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AssistantLauncher />
      <BottomNav />
      <CommandPalette open={palette.open} onClose={palette.close} />
      <ScrollRestoration />
    </div>
  )
}
