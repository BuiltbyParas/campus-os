import { useSyncExternalStore } from 'react'

import { getBackendState, subscribeBackendState } from '@/services/http'

/** Lets the UI tell the truth about where its data came from. */
export function useBackendState() {
  return useSyncExternalStore(
    (onChange) => subscribeBackendState(() => onChange()),
    getBackendState,
    () => 'unknown' as const,
  )
}
