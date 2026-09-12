import { Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { accountNav, navSections, type NavItem } from '@/app/navigation'
import { useStore } from '@/app/store'
import { cn } from '@/lib/utils'

import { Logo } from './Logo'

function SidebarLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'group relative flex h-11 items-center gap-3 rounded-control px-3 text-[14px] font-medium',
          'transition-[color,background-color,transform] duration-200 active:scale-[0.98]',
          isActive ? 'text-ink' : 'text-ink-muted hover:bg-brand/[0.08] hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* The active surface is a solid tint, not glass: glass belongs to the
              bar itself, and nesting it here would muddy both layers. */}
          {isActive ? (
            <>
              <span aria-hidden className="absolute inset-0 rounded-control bg-brand-soft" />
              {/* A bar on the trailing edge, pointing at the content it opens —
                  the pill alone reads as a highlight, the bar reads as *you are
                  here*. */}
              <span
                aria-hidden
                className="absolute inset-y-1.5 right-0 w-[3px] rounded-full bg-brand"
              />
            </>
          ) : null}
          <item.icon
            className={cn(
              'relative size-[18px] shrink-0 transition-colors duration-200',
              isActive ? 'text-brand-ink' : 'text-ink-subtle group-hover:text-ink-muted',
            )}
            aria-hidden
          />
          <span className="relative truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

/**
 * Desktop navigation. A fixed glass rail rather than a solid panel, so the
 * ambient colour of the page reads faintly through it as you scroll.
 */
export function Sidebar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const { student } = useStore()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] lg:block">
      <div className="glass-nav flex h-full flex-col rounded-none border-y-0 border-l-0 px-4 py-5">
        <NavLink to="/app" end className="mb-7 inline-flex rounded-lg px-1" aria-label="CampusOS dashboard">
          <Logo />
        </NavLink>

        {/* The command palette is the fastest route to anything, so it sits
            above the navigation rather than hidden behind a shortcut. */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="press mb-4 flex w-full items-center gap-2.5 rounded-control border border-line bg-surface/60 px-3 py-2.5 text-left text-[13.5px] text-ink-subtle transition-colors hover:border-line-strong hover:text-ink-muted"
        >
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="flex-1 truncate">Search or jump to…</span>
          <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10.5px] font-medium">
            ⌘K
          </kbd>
        </button>

        {/* The rail scrolls on short viewports; the account block below stays
            pinned, so identity never scrolls out of reach. */}
        <nav aria-label="Primary" className="scrollbar-thin -mr-1 flex-1 overflow-y-auto pr-1">
          {navSections.map((section) => (
            <div key={section.id} className={cn(section.label && 'mt-6')}>
              {section.label ? (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.5px] text-ink-subtle">
                  {section.label}
                </p>
              ) : null}
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <SidebarLink key={item.to} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <nav
          aria-label="Account"
          className="mt-4 flex shrink-0 flex-col gap-1 border-t border-line pt-4"
        >
          {accountNav.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}

          <NavLink
            to="/app/profile"
            className="mt-3 flex items-center gap-3 rounded-control border border-line bg-surface/60 p-2.5 transition-colors duration-200 hover:border-line-strong"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand-ink">
              {student.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-ink">{student.name}</span>
              <span className="block truncate text-[11.5px] text-ink-subtle">
                {student.program} · Semester {student.semester}
              </span>
            </span>
          </NavLink>
        </nav>
      </div>
    </aside>
  )
}
