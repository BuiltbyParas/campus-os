/**
 * The seam between CampusOS and its backend.
 *
 * Every read goes through `request`, which tries the API and falls back to
 * local demo data on *any* failure — no backend running, no network, a 500, a
 * timeout. That is what makes the hackathon demo safe: the app degrades to
 * demo data instead of showing a broken screen.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
const TIMEOUT_MS = 3500

type BackendState = 'unknown' | 'online' | 'offline'

let backendState: BackendState = 'unknown'
const listeners = new Set<(state: BackendState) => void>()

export function getBackendState() {
  return backendState
}

export function subscribeBackendState(listener: (state: BackendState) => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function setBackendState(next: BackendState) {
  if (backendState === next) return
  backendState = next
  listeners.forEach((l) => l(next))
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
    if (!response.ok) {
      throw new ApiError(`Request failed: ${path}`, response.status)
    }
    return (await response.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

/** Small pause so skeleton states are perceptible rather than flashing. */
function settle<T>(value: T, ms = 140): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function request<T>(
  path: string,
  fallback: () => T,
  init?: RequestInit,
): Promise<T> {
  // Once we know the backend is absent, stop paying the timeout on every query.
  if (backendState === 'offline') {
    return settle(fallback())
  }

  try {
    const data = await fetchJson<T>(path, init)
    setBackendState('online')
    return data
  } catch (error) {
    setBackendState('offline')
    if (import.meta.env.DEV) {
      console.info(`[CampusOS] ${path} unavailable — serving demo data.`, error)
    }
    return settle(fallback())
  }
}

/** Writes that must still "succeed" in demo mode, returning an optimistic result. */
export async function mutate<T>(
  path: string,
  body: unknown,
  fallback: () => T,
  method: 'POST' | 'PATCH' | 'DELETE' = 'POST',
): Promise<T> {
  if (backendState === 'offline') {
    return settle(fallback(), 320)
  }
  try {
    const data = await fetchJson<T>(path, { method, body: JSON.stringify(body) })
    setBackendState('online')
    return data
  } catch (error) {
    setBackendState('offline')
    if (import.meta.env.DEV) {
      console.info(`[CampusOS] ${path} write fell back to demo mode.`, error)
    }
    return settle(fallback(), 320)
  }
}
