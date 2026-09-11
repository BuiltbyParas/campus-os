import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Check, Info, X } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import { easeOutSoft } from '@/lib/motion'
import { cn, uid } from '@/lib/utils'

type ToastTone = 'success' | 'error' | 'info'

interface Toast {
  id: string
  tone: ToastTone
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  /** Neutral acknowledgement — the tone was already supported internally. */
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/** Every user action in CampusOS confirms itself through this. */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

const ICONS: Record<ToastTone, typeof Check> = {
  success: Check,
  error: AlertTriangle,
  info: Info,
}

const TONES: Record<ToastTone, string> = {
  success: 'bg-ok-soft text-ok-ink',
  error: 'bg-danger-soft text-danger-ink',
  info: 'bg-brand-soft text-brand-ink',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (input: Omit<Toast, 'id'>) => {
      const id = uid('toast')
      setToasts((current) => [...current.slice(-2), { ...input, id }])
      timers.current.set(id, window.setTimeout(() => dismiss(id), 4200))
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast({ tone: 'success', title, description }),
      error: (title, description) => toast({ tone: 'error', title, description }),
      info: (title, description) => toast({ tone: 'info', title, description }),
    }),
    [toast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end sm:px-0"
          role="region"
          aria-live="polite"
          aria-label="Notifications"
        >
          <AnimatePresence initial={false}>
            {toasts.map((t) => {
              const Icon = ICONS[t.tone]
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.24, ease: easeOutSoft }}
                  className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-tile border border-line bg-surface p-3 shadow-e4"
                >
                  <span
                    className={cn('grid size-7 shrink-0 place-items-center rounded-full', TONES[t.tone])}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-ink">{t.title}</p>
                    {t.description ? (
                      <p className="mt-0.5 text-[13px] text-ink-muted">{t.description}</p>
                    ) : null}
                    {t.action ? (
                      <button
                        type="button"
                        onClick={() => {
                          t.action?.onClick()
                          dismiss(t.id)
                        }}
                        className="mt-1.5 text-[13px] font-medium text-brand-ink hover:underline"
                      >
                        {t.action.label}
                      </button>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss"
                    className="-mr-0.5 -mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
