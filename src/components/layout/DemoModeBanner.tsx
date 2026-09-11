import { CloudOff } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useBackendState } from '@/hooks/useBackendState'

/**
 * Tells the truth about where the data came from.
 *
 * Every read goes through a seam that calls the API and falls back to demo data
 * on failure. When that fallback is in use — which, with no backend running, is
 * always — the product says so once rather than pretending the figures are
 * live. It appears after a short delay so it never flashes during the first
 * request, and can be dismissed for the session.
 */
export function DemoModeBanner() {
  const backend = useBackendState()
  const [dismissed, setDismissed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 600)
    return () => window.clearTimeout(timer)
  }, [])

  if (backend !== 'offline' || dismissed || !ready) return null

  return (
    <div className="border-b border-line bg-surface-muted/60">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <CloudOff className="size-4 shrink-0 text-ink-subtle" aria-hidden />
        <p className="min-w-0 flex-1 text-[12.5px] text-ink-muted">
          No campus API connected — showing demo data. Figures are illustrative, not official
          records.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded px-2 py-1 text-[12.5px] font-medium text-ink-subtle transition-colors hover:text-ink"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
