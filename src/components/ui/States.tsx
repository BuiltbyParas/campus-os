import { AlertTriangle, RefreshCw, SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './Button'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface/60 px-6 py-14 text-center',
        className,
      )}
    >
      <div className="mb-3 grid size-11 place-items-center rounded-full bg-surface-muted text-ink-subtle">
        {icon ?? <SearchX className="size-5" aria-hidden />}
      </div>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this just now. Your connection may have dropped.',
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-danger-soft bg-danger-soft/40 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-3 grid size-11 place-items-center rounded-full bg-danger-soft text-danger-ink">
        <AlertTriangle className="size-5" aria-hidden />
      </div>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onRetry}
          icon={<RefreshCw className="size-4" aria-hidden />}
        >
          Try again
        </Button>
      ) : null}
    </div>
  )
}
