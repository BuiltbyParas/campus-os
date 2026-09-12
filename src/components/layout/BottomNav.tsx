import { NavLink } from 'react-router-dom'

import { bottomNav } from '@/app/navigation'
import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'

/**
 * Mobile tab bar.
 *
 * A floating layer rather than a strip welded to the bottom edge — content
 * passing beneath it is what makes the material read as a layer rather than as
 * a border. Each target is 56px tall, comfortably above the 44px minimum, and
 * the active tab carries the accent as a gradient surface plus a bar above it,
 * so the current destination survives a glance at arm's length.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="flex items-stretch gap-0.5 rounded-2xl border border-line bg-canvas-2/85 p-1.5 backdrop-blur-[12px] elev-3">
        {bottomNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => haptic('tick')}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5',
                'transition-[color,transform] duration-200 active:scale-95',
                isActive ? 'text-ink' : 'text-ink-faint',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <>
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-xl bg-brand/20 shadow-[var(--glow-xs)]"
                    />
                    <span
                      aria-hidden
                      className="grad-accent absolute inset-x-4 top-0 h-[2px] rounded-full"
                    />
                  </>
                ) : null}
                <item.icon
                  className={cn(
                    'relative size-[20px] transition-transform duration-200',
                    isActive && 'scale-110 text-brand-ink',
                  )}
                  aria-hidden
                />
                <span className="relative text-[10.5px] font-semibold leading-none">
                  {item.shortLabel ?? item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
