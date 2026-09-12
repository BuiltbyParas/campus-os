import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'

import { CommandPalette } from '@/components/app/CommandPalette'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { pageTransition } from '@/lib/motion'

import { AssistantLauncher } from './AssistantLauncher'
import { BottomNav } from './BottomNav'
import { DemoModeBanner } from './DemoModeBanner'
import { MobileHeader } from './MobileHeader'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

function useScrollToTopOnNavigate() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
}

export function AppShell() {
  const location = useLocation()
  const reduced = useReducedMotion()
  const palette = useCommandPalette()
  useScrollToTopOnNavigate()

  return (
    <div className="dark relative min-h-dvh bg-canvas text-ink">
      {/* Ambient environment. It exists so the glass layers have something to
          pick colour up from — without it the material reads as flat grey. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-[620px] rounded-full bg-brand/10 blur-[130px]" />
        <div className="absolute -right-40 top-1/3 size-[540px] rounded-full bg-info/[0.07] blur-[130px]" />
      </div>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-control focus:bg-brand focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-on-brand"
      >
        Skip to content
      </a>

      <Sidebar onOpenCommandPalette={palette.toggle} />
      <MobileHeader onOpenCommandPalette={palette.toggle} />

      <div className="relative lg:pl-[248px]">
        <TopBar onOpenCommandPalette={palette.toggle} />
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
