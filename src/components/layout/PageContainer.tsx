import { useEffect, useRef, useState, type ReactNode } from 'react'

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

/**
 * The page title.
 *
 * On a phone it behaves the way a native screen title does: it opens large in
 * the content, and once it scrolls under the header a compact copy fades into
 * the bar. That is what keeps "where am I" answerable after the title has
 * gone, without spending a permanent row of chrome on it. On a desktop, where
 * the sidebar already answers that question, it is simply a heading.
 *
 * The scroll position is never polled — an IntersectionObserver fires twice
 * per screen rather than sixty times a second.
 */
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
  const ref = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      /* The mobile header is 64px tall, so the title counts as gone the moment
         it passes under it rather than when it leaves the viewport. */
      { rootMargin: '-64px 0px 0px 0px', threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /* The compact title and the brand mark share one slot in the header, so the
     shell has to know when the title has taken it. A data attribute on the
     root is the lightest way to say so: the header reacts in CSS, with no
     context, no store and no re-render of the chrome on every scroll. */
  useEffect(() => {
    const root = document.documentElement
    if (collapsed) root.dataset.compactTitle = '1'
    else delete root.dataset.compactTitle
    return () => {
      delete root.dataset.compactTitle
    }
  }, [collapsed])

  return (
    <>
      <div
        aria-hidden
        className={cn(
          'pointer-events-none fixed inset-x-0 top-0 z-[41] flex h-16 items-center justify-center px-28 md:hidden',
          'transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,0.9,0.1,1)]',
          collapsed ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0',
        )}
      >
        <span className="truncate text-[15px] font-bold tracking-[-0.01em] text-ink">{title}</span>
      </div>

      <div ref={ref} className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
        <div className="min-w-0">
          <h1
            className={cn(
              'text-[28px] font-bold leading-[1.06] tracking-[-0.03em] text-ink sm:text-[32px]',
              'transition-opacity duration-200',
              collapsed ? 'opacity-0 md:opacity-100' : 'opacity-100',
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </>
  )
}
