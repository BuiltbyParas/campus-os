import type { ComponentProps, ElementType, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useTilt } from '@/hooks/useTilt'
import { cn } from '@/lib/utils'

/**
 * The content surface.
 *
 * Every card on the app surface is this one, so depth reads consistently:
 * a 1.5px accent-tinted border, a seated shadow at rest, and on hover the
 * accent arriving as both a brighter border and a glow. Cards that lead
 * somewhere also lift; cards that do not, do not — a lift on a dead card is a
 * promise the interface cannot keep.
 */
export function Card<T extends ElementType = 'div'>({
  as,
  interactive,
  glow,
  className,
  children,
  ...props
}: {
  as?: T
  /** Adds the lift and press response. Use for cards that navigate. */
  interactive?: boolean
  /** Ambient inner glow, for the one or two cards that lead a screen. */
  glow?: boolean
  className?: string
  children?: ReactNode
} & Omit<ComponentProps<T>, 'as' | 'className' | 'children'>) {
  const Component = (as ?? 'div') as ElementType

  return (
    <Component
      className={cn(
        'card-premium',
        interactive && 'card-interactive cursor-pointer',
        glow && 'shadow-[var(--shadow-xs),var(--glow-inner)]',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * A card that leans towards the cursor.
 *
 * Reserved for the one hero surface on a screen. The tilt is driven by CSS
 * custom properties (see `useTilt`), so a pointer move costs one composited
 * transform rather than a React render, and it switches itself off on touch
 * devices and under `prefers-reduced-motion`.
 */
export function TiltCard({
  to,
  className,
  children,
  max,
  lift,
  ...props
}: {
  /** Renders the card as a link when present. */
  to?: string
  className?: string
  children?: ReactNode
  max?: number
  lift?: number
} & Omit<ComponentProps<'div'>, 'className' | 'children'>) {
  const { ref, tiltProps } = useTilt({ max, lift })

  const body = (
    <div ref={ref} className={cn('tilt', className)} {...tiltProps} {...props}>
      {children}
    </div>
  )

  return to ? (
    <Link to={to} className="block focus-visible:rounded-card">
      {body}
    </Link>
  ) : (
    body
  )
}

/**
 * The heading above a block of content.
 *
 * Carries an optional count line, because "Needs attention" and "Needs
 * attention · 3 items" are different messages and the second one is the one a
 * student can act on.
 */
export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string
  subtitle?: string
  action?: { label: string; to: string }
  className?: string
}) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-[24px] font-bold tracking-[-0.25px] text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-[13px] text-ink-subtle">{subtitle}</p> : null}
      </div>
      {action ? (
        <Link
          to={action.to}
          className="tap group inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-brand-ink transition-colors hover:text-brand"
        >
          {action.label}
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      ) : null}
    </div>
  )
}
