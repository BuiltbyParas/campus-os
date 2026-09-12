import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Moon, Search, Settings, Sun, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { useTheme } from '@/app/theme'
import { Tooltip } from '@/components/ui/Tooltip'
import { popIn } from '@/lib/motion'
import { cn } from '@/lib/utils'

import { NotificationMenu } from './NotificationMenu'

/**
 * The desktop top bar.
 *
 * Deliberately not a second navigation — the rail already carries
 * destinations. This carries the four things that are true *right now*: the
 * time, whether anything is waiting, who is signed in, and the way into
 * search. The clock is the reason it exists: a campus product is about being
 * somewhere at a particular time, and a live clock in the chrome makes every
 * countdown elsewhere legible without arithmetic.
 */

/** Closes a menu on an outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) close()
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return ref
}

export function TopBar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const { student } = useStore()
  const { resolved, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useDismiss(menuOpen, () => setMenuOpen(false))

  /* Ticks on the minute rather than the second: the display has no seconds, so
     a per-second interval would repaint sixty times for one visible change. */
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const fullDate = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-canvas/80 backdrop-blur-[12px] elev-1 md:block">
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-6 px-8">
        {/* ------------------------------------------------------- the clock */}
        <Tooltip label={`${fullDate} · updates every minute`} side="bottom">
          <span className="flex items-center gap-2.5">
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-ok opacity-60 [animation:pulse-ring_2.4s_ease-out_infinite]" />
              <span className="relative inline-flex size-2 rounded-full bg-ok" />
            </span>
            <span className="text-[17px] font-bold tabular-nums text-brand-ink">{time}</span>
            <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-ink-faint">
              Live
            </span>
          </span>
        </Tooltip>

        {/* ------------------------------------------------------------ search */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className={cn(
            'group hidden h-11 w-[320px] items-center gap-2.5 rounded-control border-[1.5px] border-line bg-field px-3.5 lg:flex',
            'text-left text-[13.5px] text-ink-faint transition-[border-color,box-shadow,background-color] duration-200',
            'hover:border-line-strong hover:bg-field-hover hover:shadow-[var(--glow-xs)]',
          )}
        >
          <Search className="size-[18px] shrink-0 text-brand-ink" aria-hidden />
          <span className="flex-1 truncate">Search anything…</span>
          <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10.5px] font-semibold">
            ⌘K
          </kbd>
        </button>

        {/* ------------------------------------------------------------- right */}
        <div className="flex items-center gap-1.5">
          <Tooltip label={resolved === 'dark' ? 'Switch to light' : 'Switch to dark'} side="bottom">
            <button
              type="button"
              onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
              aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="grid size-10 place-items-center rounded-full text-ink-subtle transition-[color,background-color] duration-200 hover:bg-brand-soft hover:text-ink"
            >
              {resolved === 'dark' ? (
                <Moon className="size-[19px] transition-transform duration-300 hover:rotate-180" aria-hidden />
              ) : (
                <Sun className="size-[19px] transition-transform duration-300 hover:rotate-180" aria-hidden />
              )}
            </button>
          </Tooltip>

          <NotificationMenu />

          {/* ------------------------------------------------- profile menu */}
          <div ref={menuRef} className="relative ml-1">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-3 transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-[var(--glow-xs)]"
            >
              <span className="grad-accent grid size-9 place-items-center rounded-full text-[12.5px] font-bold text-on-brand">
                {student.initials}
              </span>
              <span className="text-left">
                <span className="block text-[13px] font-semibold leading-tight text-ink">
                  {student.name.split(' ')[0]}
                </span>
                <span className="flex items-center gap-1 text-[11px] leading-tight text-ink-faint">
                  <span aria-hidden className="size-1.5 rounded-full bg-ok" />
                  Active
                </span>
              </span>
            </button>

            <AnimatePresence>
              {menuOpen ? (
                <motion.div
                  role="menu"
                  variants={popIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="glass-modal absolute right-0 top-[calc(100%+10px)] w-[230px] overflow-hidden rounded-xl p-1.5 elev-3"
                >
                  <div className="border-b border-divider px-3 py-2.5">
                    <p className="truncate text-[13px] font-semibold text-ink">{student.name}</p>
                    <p className="truncate text-[11.5px] text-ink-faint">{student.email}</p>
                  </div>

                  {[
                    { to: '/app/profile', label: 'Profile', icon: User },
                    { to: '/app/settings', label: 'Settings', icon: Settings },
                  ].map((entry) => (
                    <Link
                      key={entry.to}
                      to={entry.to}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex h-10 items-center gap-2.5 rounded-lg px-3 text-[13.5px] text-ink-muted transition-colors hover:bg-brand-soft hover:text-ink"
                    >
                      <entry.icon className="size-4" aria-hidden />
                      {entry.label}
                    </Link>
                  ))}

                  <Link
                    to="/"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 flex h-10 items-center gap-2.5 rounded-lg border-t border-divider px-3 text-[13.5px] text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger-ink"
                  >
                    <LogOut className="size-4" aria-hidden />
                    Sign out
                  </Link>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
