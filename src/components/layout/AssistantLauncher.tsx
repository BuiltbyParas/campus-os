import { Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

/**
 * The assistant's floating entry point.
 *
 * The one control on the surface that is always available and always the same
 * shape, so it becomes muscle memory rather than something to look for. It
 * hides on the assistant screen itself, where it would be a button that goes
 * nowhere.
 *
 * The slow pulse is deliberate and never stops: it is the only element on the
 * surface that invites rather than responds, and a static circle in the corner
 * reads as decoration.
 */
export function AssistantLauncher() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/app/assistant')) return null

  return (
    <Link
      to="/app/assistant"
      aria-label="Ask the CampusOS assistant"
      className="group fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-40 lg:bottom-8 lg:right-8"
    >
      <span className="relative grid size-14 place-items-center lg:size-16">
        {/* The halo is a sibling rather than a shadow so it can scale on its
            own without dragging the icon with it. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-brand/30 opacity-70 blur-[14px] transition-[transform,opacity] duration-300 [animation:pulse-ring_2.8s_ease-out_infinite] group-hover:scale-125 group-hover:opacity-100"
        />
        <span
          className={[
            'grad-accent relative grid size-14 place-items-center rounded-full border border-brand-border text-on-brand elev-4 lg:size-16',
            'transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            'group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:shadow-[var(--shadow-lg),var(--glow-l)]',
            'group-active:scale-95',
          ].join(' ')}
        >
          <Sparkles className="size-6 transition-transform duration-300 group-hover:rotate-12 lg:size-7" aria-hidden />
        </span>
      </span>

      {/* Names the control on hover for a pointer user; the aria-label covers
          everyone else. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-line bg-surface-raised px-3 py-2 text-[12.5px] font-medium text-ink opacity-0 elev-2 transition-opacity duration-200 group-hover:opacity-100 lg:block"
      >
        Ask CampusOS anything
      </span>
    </Link>
  )
}
