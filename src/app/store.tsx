import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { demoStudent } from '@/data'
import type { AppPreferences, NotificationPreferences, Student } from '@/types'

/**
 * Client-side state that belongs to the person using the app: what they have
 * read, what they registered for, how they want to be notified.
 *
 * Persisted to localStorage so the demo survives a refresh, and deliberately
 * separate from server data — everything here would move to the account record
 * once there is a backend to hold it.
 */

const STORAGE_KEY = 'campusos.state.v2'

interface PersistedState {
  registeredEventIds: string[]
  readNotificationIds: string[]
  notifications: NotificationPreferences
  preferences: AppPreferences
}

const EMPTY: PersistedState = {
  registeredEventIds: [],
  readNotificationIds: [],
  notifications: {
    attendanceAlerts: true,
    timetableChanges: true,
    complaintUpdates: true,
    eventReminders: false,
  },
  preferences: {
    weekStartsMonday: true,
    compactTimetable: false,
    showDemoLabels: true,
  },
}

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      ...EMPTY,
      ...parsed,
      notifications: { ...EMPTY.notifications, ...parsed.notifications },
      preferences: { ...EMPTY.preferences, ...parsed.preferences },
    }
  } catch {
    // Private browsing, blocked storage, corrupt JSON — start clean rather than crash.
    return EMPTY
  }
}

interface StoreValue extends PersistedState {
  student: Student
  isRegistered: (id: string) => boolean
  toggleRegistered: (id: string) => boolean
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: (ids: string[]) => void
  setNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => void
  setPreference: (key: keyof AppPreferences, value: boolean) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage unavailable — the app still works, it just will not remember.
    }
  }, [state])

  const toggleRegistered = useCallback((id: string) => {
    let nowActive = false
    setState((prev) => {
      const has = prev.registeredEventIds.includes(id)
      nowActive = !has
      return {
        ...prev,
        registeredEventIds: has
          ? prev.registeredEventIds.filter((x) => x !== id)
          : [...prev.registeredEventIds, id],
      }
    })
    return nowActive
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      student: demoStudent,
      isRegistered: (id) => state.registeredEventIds.includes(id),
      toggleRegistered,
      markNotificationRead: (id) =>
        setState((prev) =>
          prev.readNotificationIds.includes(id)
            ? prev
            : { ...prev, readNotificationIds: [...prev.readNotificationIds, id] },
        ),
      markAllNotificationsRead: (ids) =>
        setState((prev) => ({
          ...prev,
          readNotificationIds: Array.from(new Set([...prev.readNotificationIds, ...ids])),
        })),
      setNotificationPreference: (key, next) =>
        setState((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: next } })),
      setPreference: (key, next) =>
        setState((prev) => ({ ...prev, preferences: { ...prev.preferences, [key]: next } })),
    }),
    [state, toggleRegistered],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
