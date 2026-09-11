import { NavLink } from 'react-router-dom'

import { bottomNav } from '@/app/navigation'
import { cn } from '@/lib/utils'

/**
 * Mobile tab bar.
 *
 * A floating glass layer rather than a solid strip welded to the bottom edge —
 * content passing beneath it is what makes the material legible as a layer.
 * Each target is 56px tall, comfortably above the 44px touch minimum.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="glass-nav flex items-stretch gap-0.5 rounded-2xl p-1.5">
        {bottomNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5',
                'transition-colors duration-200',
                isActive ? 'text-ink' : 'text-ink-subtle',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-xl border border-brand-border/40 bg-brand-soft"
                  />
                ) : null}
                <item.icon
                  className={cn('relative size-[19px]', isActive && 'text-brand-ink')}
                  aria-hidden
                />
                <span className="relative text-[10.5px] font-medium leading-none">
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
