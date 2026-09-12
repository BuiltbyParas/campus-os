import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-md', className)} aria-hidden />
}

export function SkeletonText({ lines = 2, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

/** Matches the footprint of a content card so layout does not jump on load. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card-premium p-5', className)}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <SkeletonText lines={2} className="mt-4" />
      <Skeleton className="mt-5 h-9 w-full" />
    </div>
  )
}

export function SkeletonGrid({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/** Stand-in for a list of rows (timetable, attendance, requests). */
export function SkeletonRows({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
