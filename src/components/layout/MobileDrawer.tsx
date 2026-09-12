import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { accountNav, navSections, type NavItem } from '@/app/navigation'
import { useStore } from '@/app/store'
import { useTheme } from '@/app/theme'
import { useNavBadges, type NavBadge } from '@/hooks/useNavBadges'
import { useReducedMotionPreference } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

import { Logo } from './Logo'

/**
 * Navigation for a phone.
 *
 * The thumb bar carries the five destinations a student opens between classes;
 * everything else — academics, fees, exams, the account — lives here. Without
 * it those screens are reachable only by luck from a link on the dashboard,
 * which is the state this drawer exists to fix.
 *
 * It behaves like a sheet, not a page: it traps focus, closes on Escape, on a
 * backdrop tap, on a leftward swipe and on navigation, and it locks the page
 * behind it so a scroll gesture cannot leak through to content the drawer is
 * covering.
 */

function DrawerLink({
  item,
  badge,
  onNavigate,
}: {
  item: NavItem
  badge?: NavBadge
  onNavigate: () => void
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          /* 52px rows: this is a list navigated with a thumb, and the extra
             8px over the 44px minimum is what stops mis-taps between rows. */
          'group relative flex min-h-[52px] items-center gap-3.5 rounded-tile px-3.5 text-[15px] font-medium',
          'transition-[background-color,color] duration-200 active:scale-[0.99]',
          isActive ? 'bg-brand/20 text-ink' : 'text-ink-subtle active:bg-brand/10',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden
            className={cn(
              'grad-accent absolute inset-y-2.5 left-0 w-[3px] rounded-full transition-opacity duration-200',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          <item.icon
            className={cn(
              'size-[22px] shrink-0 transition-colors duration-200',
              isActive ? 'text-brand-ink' : 'text-ink-faint',
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {badge ? (
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums',
                badge.tone,
              )}
            >
              {badge.value}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  )
}

export function MobileDrawer({
  open,
  onClose,
  onOpenCommandPalette,
}: {
  open: boolean
  onClose: () => void
  onOpenCommandPalette: () => void
}) {
  const { student } = useStore()
  const { resolved, setTheme } = useTheme()
  const badges = useNavBadges()
  const { pathname } = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotionPreference()

  /* Navigating is the drawer's whole purpose, so a route change closes it
     rather than leaving the sheet sitting over the screen it just opened. */
  useEffect(() => {
    if (open) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!open) return

    restoreTo.current = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 20)

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])',
      )
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      restoreTo.current?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <motion.div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[6px]"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[300px] max-w-[86vw] flex-col border-r-[1.5px] border-line bg-[linear-gradient(180deg,var(--canvas),color-mix(in_oklab,var(--surface)_80%,transparent))] outline-none elev-4"
            initial={reduced ? undefined : { x: '-100%' }}
            animate={reduced ? undefined : { x: 0 }}
            exit={reduced ? undefined : { x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.2, 0.9, 0.1, 1] }}
            /* A leftward flick closes it, which is how every sheet on a phone
               is expected to behave. */
            drag={reduced ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.4, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70 || info.velocity.x < -450) onClose()
            }}
          >
            <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation"
                className="grid size-11 place-items-center rounded-full text-ink-subtle transition-colors duration-200 active:bg-brand-soft active:text-ink"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            {/* ------------------------------------------------------ identity */}
            <Link
              to="/app/profile"
              className="mx-3 flex items-center gap-3 rounded-tile border-[1.5px] border-line bg-field-raised p-3"
            >
              <span className="grad-accent grid size-11 shrink-0 place-items-center rounded-full text-[13px] font-bold text-on-brand">
                {student.initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold text-ink">
                  {student.name}
                </span>
                <span className="block truncate text-[12px] text-ink-faint">
                  {student.program} · Semester {student.semester}
                </span>
              </span>
            </Link>

            {/* -------------------------------------------------------- search */}
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenCommandPalette()
              }}
              className="mx-3 mt-3 flex h-12 items-center gap-2.5 rounded-control border-[1.5px] border-line bg-field px-3.5 text-left text-[14px] text-ink-faint"
            >
              <Search className="size-[18px] shrink-0" aria-hidden />
              <span className="flex-1 truncate">Search anything…</span>
            </button>

            {/* -------------------------------------------------- destinations */}
            <nav
              aria-label="All destinations"
              className="scrollbar-premium mt-4 flex-1 overflow-y-auto px-3 pb-2"
            >
              {navSections.map((section) => (
                <div key={section.id} className="mb-5">
                  {section.label ? (
                    <p className="mb-1.5 px-3.5 text-[10px] font-bold uppercase tracking-[1px] text-ink-faint">
                      {section.label}
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-1">
                    {section.items.map((item) => (
                      <DrawerLink
                        key={item.to}
                        item={item}
                        badge={item.badge ? badges[item.badge] : undefined}
                        onNavigate={onClose}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-t border-divider pt-4">
                <p className="mb-1.5 px-3.5 text-[10px] font-bold uppercase tracking-[1px] text-ink-faint">
                  Account
                </p>
                <div className="flex flex-col gap-1">
                  {accountNav.map((item) => (
                    <DrawerLink key={item.to} item={item} onNavigate={onClose} />
                  ))}
                </div>
              </div>
            </nav>

            {/* --------------------------------------------------------- foot */}
            <div className="flex items-center gap-2 border-t border-divider px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-control border border-line text-[13px] font-semibold text-ink-muted"
              >
                {resolved === 'dark' ? (
                  <Moon className="size-4" aria-hidden />
                ) : (
                  <Sun className="size-4" aria-hidden />
                )}
                {resolved === 'dark' ? 'Dark' : 'Light'}
              </button>

              <Link
                to="/"
                onClick={onClose}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-control border border-line text-[13px] font-semibold text-ink-muted"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Link>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
