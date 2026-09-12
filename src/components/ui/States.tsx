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
        'card-premium flex flex-col items-center justify-center border-dashed px-6 py-16 text-center',
        className,
      )}
    >
      <div className="mb-4 grid size-14 place-items-center rounded-full border border-line bg-brand-soft text-brand-ink">
        {icon ?? <SearchX className="size-6" aria-hidden />}
      </div>
      <p className="text-[17px] font-bold text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
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
        'card-premium flex flex-col items-center justify-center border-danger/30 bg-danger-soft/30 px-6 py-14 text-center',
        className,
      )}
    >
      <div className="mb-4 grid size-14 place-items-center rounded-full border border-danger/30 bg-danger-soft text-danger-ink">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <p className="text-[17px] font-bold text-ink">{title}</p>
      <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-ink-muted">{description}</p>
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
