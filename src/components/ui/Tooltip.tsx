import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * A hover/focus tooltip built with CSS only.
 *
 * No state, no positioning library, no portal: the bubble is a sibling that
 * the group's hover and focus-within states reveal. That makes it free to use
 * anywhere in a list without a hook per row — the tradeoff is that it cannot
 * escape an `overflow: hidden` ancestor, which is why the components that need
 * one give the tooltip's host room.
 *
 * It is presentation only. Anything a tooltip says must also be available to a
 * screen reader through the trigger's own accessible name.
 */
export function Tooltip({
  label,
  children,
  side = 'top',
  className,
}: {
  label: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'right' | 'left'
  className?: string
}) {
  const sides = {
    top: 'bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2',
    bottom: 'top-[calc(100%+8px)] left-1/2 -translate-x-1/2',
    right: 'left-[calc(100%+10px)] top-1/2 -translate-y-1/2',
    left: 'right-[calc(100%+10px)] top-1/2 -translate-y-1/2',
  }

  return (
    <span className={cn('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-line bg-surface-raised px-2.5 py-1.5',
          'text-[12px] font-medium text-ink elev-2',
          'opacity-0 transition-[opacity,transform] duration-200',
          'group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
          sides[side],
        )}
      >
        {label}
      </span>
    </span>
  )
}
