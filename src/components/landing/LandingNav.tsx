import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Logo } from '@/components/layout/Logo'
import { landingNav } from '@/data/landing'
import { easeOutSoft } from '@/lib/motion'
import { cn } from '@/lib/utils'

import { Container } from './primitives'

/**
 * Sticky top bar. Transparent over the hero, then settles into a blurred,
 * hairline-bordered bar once the page scrolls — the only chrome change on the
 * whole page, which is what makes it read as intentional.
 */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const reduced = useReducedMotion()

  /**
   * The open sheet locks body scrolling, which would also swallow a native
   * anchor jump. So close the sheet first, then scroll on the next frame.
   */
  function handleMobileNav(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const target = document.querySelector(href)
    if (!target) return

    event.preventDefault()
    setMenuOpen(false)
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      window.history.replaceState(null, '', href)
    })
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* The sheet owns the viewport while open. */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      {/* The bar is a floating piece of material, not a full-width band welded
          to the top edge — it only takes on the glass once content is passing
          underneath it, which is the moment the layer means anything. */}
      <div
        className={cn(
          'mx-auto max-w-[1200px] rounded-2xl transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300',
          scrolled || menuOpen ? 'glass-nav' : 'border border-transparent',
        )}
      >
        <Container className="flex h-14 items-center justify-between gap-6 px-4 sm:h-16 sm:px-5">
        <Link to="/" className="rounded-lg" aria-label="CampusOS home">
          <Logo />
        </Link>

        {/* ------------------------------------------------ desktop links */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {landingNav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-control px-3 py-2 text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-control px-3 py-2 text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            Log in
          </Link>
          <Link
            to="/app"
            className="group inline-flex h-10 items-center gap-1.5 rounded-control bg-brand px-4 text-sm font-medium text-on-brand shadow-[0_0_0_1px_var(--brand-border),0_8px_24px_-12px_var(--brand)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-brand-hover hover:shadow-[0_0_0_1px_var(--brand-border),0_10px_30px_-10px_var(--brand)] active:scale-[0.98]"
          >
            Enter CampusOS
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ------------------------------------------------- mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="landing-mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="inline-flex size-10 items-center justify-center rounded-control border border-line bg-surface/60 text-ink transition-colors duration-150 hover:border-line-strong md:hidden"
        >
          {menuOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
        </button>
      </Container>

      {/* --------------------------------------------------- mobile sheet */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="landing-mobile-menu"
            initial={reduced ? undefined : { opacity: 0, y: -8 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: easeOutSoft }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <Container className="flex flex-col gap-1 px-4 py-5 sm:px-5">
              {landingNav.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleMobileNav(event, link.href)}
                  className="rounded-tile px-3 py-3 text-[15px] font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-control border border-line bg-surface text-[15px] font-medium text-ink transition-colors hover:border-line-strong"
                >
                  Log in
                </Link>
                <Link
                  to="/app"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-control bg-brand text-[15px] font-medium text-on-brand"
                >
                  Enter CampusOS
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </div>
    </header>
  )
}
