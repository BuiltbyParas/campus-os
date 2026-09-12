import { useQueryClient } from '@tanstack/react-query'
import { Loader2, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'

/**
 * Pull down to refresh.
 *
 * The gesture every native app has and no web app bothers with, which is most
 * of why a web app feels like a web app. Three details do the work:
 *
 *   - **Resistance.** The content follows the finger at a decreasing rate, so
 *     the pull feels like stretching something rather than dragging it. A 1:1
 *     translation reads as a bug.
 *   - **A threshold you can feel.** Crossing it fires a haptic tick and the
 *     indicator locks in, so the commit is known before the finger lifts.
 *   - **It only arms at the top.** The gesture is claimed only when the page
 *     is already scrolled to 0 and the finger moves down, so it can never
 *     steal a normal scroll.
 *
 * The refresh itself invalidates every query, which is what "refresh" means
 * in a product whose screens are all views of the same campus data.
 */

const THRESHOLD = 72
const MAX_PULL = 120

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const armed = useRef(false)
  const startY = useRef(0)
  const passedThreshold = useRef(false)

  const run = useCallback(async () => {
    setRefreshing(true)
    haptic('success')
    const started = Date.now()
    try {
      await queryClient.invalidateQueries()
    } finally {
      /* Hold the spinner briefly even when the cache answers instantly: a
         refresh that vanishes before it is seen reads as one that did not
         happen. */
      const elapsed = Date.now() - started
      window.setTimeout(() => {
        setRefreshing(false)
        setPull(0)
      }, Math.max(0, 550 - elapsed))
    }
  }, [queryClient])

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      if (refreshing) return
      /* `scrollY <= 0` is the whole arming condition. Anywhere else on the
         page this listener does nothing at all. */
      armed.current = window.scrollY <= 0
      startY.current = event.touches[0].clientY
      passedThreshold.current = false
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!armed.current || refreshing) return
      const delta = event.touches[0].clientY - startY.current

      if (delta <= 0) {
        if (pull !== 0) setPull(0)
        return
      }

      /* Square-root resistance: the first 20px come easily, the last 20px
         take real effort. */
      const resisted = Math.min(MAX_PULL, Math.sqrt(delta) * 8)
      if (resisted > 6) event.preventDefault()
      setPull(resisted)

      if (!passedThreshold.current && resisted >= THRESHOLD) {
        passedThreshold.current = true
        haptic('tick')
      }
    }

    const onTouchEnd = () => {
      if (!armed.current) return
      armed.current = false
      if (pull >= THRESHOLD && !refreshing) void run()
      else setPull(0)
    }

    /* `passive: false` only on move, because that is the one listener that
       needs to be able to preventDefault. */
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [pull, refreshing, run])

  const progress = Math.min(1, pull / THRESHOLD)
  const active = pull > 0 || refreshing
  const offset = refreshing ? 56 : pull

  return (
    <div className="relative md:contents">
      {/* the indicator, pinned under the header and revealed by the pull */}
      <div
        aria-hidden={!refreshing}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center md:hidden"
        style={{ height: 0 }}
      >
        <div
          className={cn(
            'grid size-10 place-items-center rounded-full border border-line bg-surface elev-2',
            'transition-[opacity,box-shadow] duration-150',
            progress >= 1 && 'border-brand-border shadow-[var(--glow-s)]',
          )}
          style={{
            opacity: active ? 1 : 0,
            transform: `translateY(${Math.max(8, offset - 20)}px) scale(${0.6 + progress * 0.4})`,
            transition: armed.current ? 'none' : 'transform 300ms cubic-bezier(0.2,0.9,0.1,1)',
          }}
        >
          {refreshing ? (
            <Loader2 className="size-5 animate-spin text-brand-ink" aria-hidden />
          ) : (
            <RefreshCw
              className={cn('size-5', progress >= 1 ? 'text-brand-ink' : 'text-ink-subtle')}
              style={{ transform: `rotate(${progress * 270}deg)` }}
              aria-hidden
            />
          )}
        </div>
      </div>

      {/* The transform is applied only while the gesture is live. A standing
          `translateY(0)` would still make this element the containing block
          for every `position: fixed` descendant — which would quietly break
          the collapsing page title and anything else pinned to the viewport
          from inside the page. */}
      <div
        className="md:contents"
        style={
          active
            ? {
                transform: `translateY(${offset}px)`,
                transition:
                  armed.current && !refreshing
                    ? 'none'
                    : 'transform 350ms cubic-bezier(0.2,0.9,0.1,1)',
              }
            : undefined
        }
      >
        {children}
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {refreshing ? 'Refreshing campus data' : ''}
      </span>
    </div>
  )
}
