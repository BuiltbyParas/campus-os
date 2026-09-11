import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { SmartAction } from '@/services/signals'

/**
 * Actions ranked by what is true right now.
 *
 * Rendered as a chip row rather than a grid of tiles: these change between
 * visits, so they should read as suggestions the system is making, not as a
 * fixed menu the student learns the shape of.
 */
export function SmartActions({
  actions,
  className,
}: {
  actions: SmartAction[]
  className?: string
}) {
  if (actions.length === 0) return null

  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {actions.map((action, index) => (
        <li key={action.id}>
          <Link
            to={action.to}
            className={cn(
              'press group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 transition-colors',
              // The top-ranked action is the one the system actually recommends.
              index === 0
                ? 'border-brand-border/50 bg-brand-soft text-ink'
                : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
            )}
          >
            <span className="text-[13px] font-medium">{action.label}</span>
            {action.hint ? (
              <span className="hidden text-[12px] text-ink-subtle sm:inline">{action.hint}</span>
            ) : null}
            <ArrowUpRight
              className="size-3.5 shrink-0 opacity-50 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
