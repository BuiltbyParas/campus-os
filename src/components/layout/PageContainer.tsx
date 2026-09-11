import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * The single content container. Every page uses it, so gutters and max width
 * stay identical across the product and desktop never looks like stretched mobile.
 */
export function PageContainer({
  children,
  className,
  width = 'default',
}: {
  children: ReactNode
  className?: string
  width?: 'default' | 'wide' | 'narrow'
}) {
  const widths = {
    narrow: 'max-w-3xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
  }
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widths[width], className)}>
      {children}
    </div>
  )
}

/** Page title block with an optional description and trailing action. */
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[32px]">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[15px] text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
