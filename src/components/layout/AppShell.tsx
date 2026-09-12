import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'

import { CommandPalette } from '@/components/app/CommandPalette'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { pageTransition } from '@/lib/motion'

import { AssistantLauncher } from './AssistantLauncher'
import { BottomNav } from './BottomNav'
import { DemoModeBanner } from './DemoModeBanner'
import { TopHeader } from './TopHeader'
import { Sidebar } from './Sidebar'

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
    <div className="dark enterprise-theme relative min-h-dvh bg-canvas text-ink">
      <TopHeader onOpenCommandPalette={palette.toggle} />
      <Sidebar />

      <div className="relative pt-[56px] md:pt-[64px] lg:pt-[70px] md:pl-[80px] lg:pl-[240px]">
        <DemoModeBanner />
        <main id="main" className="pb-[80px] pt-[20px] px-[12px] md:px-[16px] lg:px-[24px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={reduced ? undefined : pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-[1920px] mx-auto"
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
