import { Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { accountNav, navSections, type NavItem } from '@/app/navigation'
import { useStore } from '@/app/store'
import { cn } from '@/lib/utils'
import { useToday } from '@/services/queries'

import { Logo, LogoMark } from './Logo'

type BadgeCounts = Partial<Record<NonNullable<NavItem['badge']>, { value: string; tone: string }>>

/**
 * A navigation row.
 *
 * The active state is carried by three things at once — a tinted surface, a
 * rail on the leading edge, and the icon taking the accent — because a single
 * background tint is easy to lose against a dark canvas, and "where am I" is
 * the one question navigation must never leave ambiguous.
 */
function SidebarLink({
  item,
  badge,
}: {
  item: NavItem
  badge?: { value: string; tone: string }
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      /* Between `md` and `lg` the rail is icons only, so the native tooltip is
         what names the destination. Above `lg` the label is on screen and the
         browser suppresses nothing — the title simply repeats it. */
      title={item.label}
      className={({ isActive }) =>
        cn(
          'group relative flex h-12 items-center gap-3 rounded-tile text-[14px] font-medium tracking-[0.3px]',
          'transition-[color,background-color,transform,box-shadow] duration-200',
          'justify-center px-0 lg:justify-start lg:px-3.5',
          isActive
            ? 'bg-brand/20 text-ink elev-1'
            : 'text-ink-subtle hover:-translate-y-0.5 hover:bg-brand/[0.12] hover:text-ink hover:elev-1',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden
            className={cn(
              'absolute inset-y-2 left-0 w-[3px] rounded-full transition-[opacity,transform] duration-200',
              'grad-accent',
              isActive
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-60',
            )}
          />
          <item.icon
            className={cn(
              'size-[22px] shrink-0 transition-[color,transform] duration-200',
              isActive
                ? 'text-brand-ink drop-shadow-[0_0_6px_rgb(99_102_241_/_0.6)]'
                : 'text-ink-faint group-hover:scale-110 group-hover:text-ink-muted',
            )}
            aria-hidden
          />

          <span className="hidden min-w-0 flex-1 truncate lg:block">{item.label}</span>

          {badge ? (
            /* In the 90px rail the badge is a dot on the corner — a number is
               not legible at that size, and the row has no room for one. The
               value itself returns with the labels at `lg`. */
            <span
              title={badge.value}
              className={cn(
                'shrink-0 rounded-full font-bold tabular-nums',
                'absolute right-2 top-2 size-2 lg:static lg:px-2 lg:py-0.5 lg:text-[10.5px]',
                badge.tone,
              )}
            >
              <span className="hidden lg:inline">{badge.value}</span>
              <span className="sr-only lg:hidden">{badge.value}</span>
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  )
}

/**
 * Desktop navigation.
 *
 * 280px on a full desktop; a 90px icon rail from `md` to `lg`, where the
 * viewport can spare the column but not the words. Below `md` it is gone
 * entirely and the thumb bar takes over.
 */
export function Sidebar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const { student } = useStore()
  const { view } = useToday(new Date())

  /* Counts come from the same view every page renders, so a rail badge can
     never claim something the destination does not show. */
  const badges: BadgeCounts = {}
  if (view.weakestCourse && view.weakestCourse.status !== 'safe') {
    badges.attendance = {
      value: `${Math.round(view.weakestCourse.percentage)}%`,
      tone: view.weakestCourse.status === 'below'
        ? 'bg-danger-soft text-danger-ink'
        : 'bg-warn-soft text-warn-ink',
    }
  }
  if (view.openRequests.length > 0) {
    badges.complaints = {
      value: String(view.openRequests.length),
      tone: 'bg-brand-soft text-brand-ink',
    }
  }
  if (view.exams?.next) {
    badges.exams = { value: 'soon', tone: 'bg-warn-soft text-warn-ink' }
  }
  if (view.fees?.nextDue) {
    badges.fees = { value: 'due', tone: 'bg-warn-soft text-warn-ink' }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[90px] md:block lg:w-[280px]">
      <div className="flex h-full flex-col border-r-[1.5px] border-line bg-[linear-gradient(180deg,var(--canvas),color-mix(in_oklab,var(--surface)_80%,transparent))] px-3 py-5 lg:px-4">
        {/* ------------------------------------------------------------ brand */}
        <NavLink
          to="/app"
          end
          className="mb-6 flex flex-col items-center gap-1 rounded-tile px-1 lg:items-start"
          aria-label="CampusOS dashboard"
        >
          {/* In the 90px rail only the mark fits, so the wordmark is swapped
              in at `lg` rather than being squeezed and clipped. */}
          <LogoMark className="lg:hidden" />
          <Logo className="hidden lg:flex" />
          {/* The tagline sits under the wordmark rather than beside it: beside
              it, two type sizes on one baseline read as a broken lockup. */}
          <span
            aria-hidden
            className="hidden pl-[42px] text-[9.5px] font-semibold uppercase tracking-[1.5px] text-ink-faint lg:block"
          >
            Intelligence layer
          </span>
        </NavLink>

        {/* ----------------------------------------------------------- search */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className={cn(
            'press-spring mb-5 flex h-11 w-full items-center gap-2.5 rounded-control border-[1.5px] border-line bg-field px-3',
            'text-left text-[13.5px] text-ink-faint transition-[border-color,color,box-shadow] duration-200',
            'hover:border-line-strong hover:text-ink-muted hover:shadow-[var(--glow-xs)]',
            'justify-center lg:justify-start',
          )}
          aria-label="Search or jump to"
        >
          <Search className="size-[18px] shrink-0" aria-hidden />
          <span className="hidden flex-1 truncate lg:block">Search anything…</span>
          <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-[10.5px] font-semibold lg:block">
            ⌘K
          </kbd>
        </button>

        {/* ------------------------------------------------------ destinations */}
        <nav
          aria-label="Primary"
          className="scrollbar-premium -mr-1 flex-1 overflow-y-auto pr-1"
        >
          {navSections.map((section) => (
            <div key={section.id} className="mb-6">
              {section.label ? (
                <p className="mb-2 hidden px-3 text-[10px] font-bold uppercase tracking-[1px] text-ink-faint lg:block">
                  {section.label}
                </p>
              ) : null}
              <div className="flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <SidebarLink
                    key={item.to}
                    item={item}
                    badge={item.badge ? badges[item.badge] : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ---------------------------------------------------------- account */}
        <nav aria-label="Account" className="mt-2 shrink-0 border-t border-divider pt-4">
          <div className="flex flex-col gap-1.5">
            {accountNav.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </div>

          <NavLink
            to="/app/profile"
            className="mt-3 hidden items-center gap-3 rounded-tile border-[1.5px] border-line bg-field-raised p-2.5 transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-[var(--glow-xs)] lg:flex"
          >
            <span className="grad-accent grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-on-brand">
              {student.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-ink">{student.name}</span>
              <span className="block truncate text-[11px] text-ink-faint">
                {student.program} · Semester {student.semester}
              </span>
            </span>
          </NavLink>
        </nav>
      </div>
    </aside>
  )
}
