import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useMediaQuery, useReducedMotionPreference } from '@/hooks/useMediaQuery'
import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'

import { Button } from './Button'

/**
 * The dialog.
 *
 * Three things a modal has to get right, and all three are handled here rather
 * than at each call site: focus moves into the dialog on open and returns to
 * whatever opened it on close, Escape and a backdrop click dismiss it, and the
 * page behind stops scrolling while it is up.
 *
 * It renders through a portal so no ancestor's `overflow` or stacking context
 * can clip or bury it.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissable = true,
}: {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** False for a dialog that must be answered rather than escaped. */
  dismissable?: boolean
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotionPreference()
  const isPhone = useMediaQuery('(max-width: 639px)')

  useEffect(() => {
    if (!open) return

    restoreTo.current = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    /* Focus the panel itself rather than the first control: a dialog that
       opens with a destructive button already focused is one Enter away from
       an accident. */
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 20)

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissable) {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      /* Keep Tab inside the dialog — a keyboard user must not be able to walk
         out into the page that the backdrop has made inert. */
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      restoreTo.current?.focus?.()
    }
  }, [open, onClose, dismissable])

  const widths = { sm: 'max-w-[420px]', md: 'max-w-[620px]', lg: 'max-w-[800px]' }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/60 backdrop-blur-[8px]"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismissable ? onClose : undefined}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cn(
              'app-surface relative w-full rounded-t-2xl border-[1.5px] border-line bg-surface p-6 pt-3 elev-4 outline-none',
              'max-h-[92vh] overflow-y-auto scrollbar-premium sm:rounded-2xl sm:p-7',
              widths[size],
            )}
            /* A sheet rises from the bottom edge on a phone and scales in from
               the centre on a desktop, because those are the two places the
               gesture that opened it came from. */
            initial={reduced ? undefined : isPhone ? { y: '100%' } : { opacity: 0, scale: 0.92, y: 16 }}
            animate={reduced ? undefined : isPhone ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? undefined : isPhone ? { y: '100%' } : { opacity: 0, scale: 0.92, y: 12 }}
            transition={
              isPhone
                ? { type: 'spring', stiffness: 380, damping: 36 }
                : { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
            }
            /* Drag it down to dismiss — on a phone the grabber is the first
               thing a thumb reaches for, and a sheet that ignores it feels
               like a web page wearing a sheet's clothes. */
            drag={isPhone && !reduced && dismissable ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 700) {
                haptic('tick')
                onClose()
              }
            }}
          >
            {/* the grabber */}
            {dismissable ? (
              <div aria-hidden className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-ink-faint/40 sm:hidden" />
            ) : null}
            {dismissable ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="absolute right-4 top-6 grid size-9 place-items-center sm:top-4 rounded-full text-ink-subtle transition-[color,background-color,transform] duration-200 hover:rotate-90 hover:bg-brand-soft hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}

            {title ? (
              <div className="mb-5 border-b border-line pb-4 pr-10">
                <h2 className="text-[24px] font-bold tracking-[-0.25px] text-ink">{title}</h2>
                {description ? (
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{description}</p>
                ) : null}
              </div>
            ) : null}

            {children}

            {footer ? (
              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

/**
 * The confirmation.
 *
 * Deliberately harder to dismiss than an ordinary dialog: no backdrop click,
 * and the destructive choice is the one that has to be reached for.
 */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
  loading?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      dismissable={false}
      footer={
        <>
          <Button variant="tertiary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-center">
        <span
          className={cn(
            'mx-auto mb-4 grid size-14 animate-[count-pop_400ms_var(--ease-premium)] place-items-center rounded-full',
            tone === 'danger' ? 'bg-danger-soft text-danger-ink' : 'bg-brand-soft text-brand-ink',
          )}
        >
          <AlertTriangle className="size-7" aria-hidden />
        </span>
        <h2 className={cn('text-[22px] font-bold', tone === 'danger' ? 'text-danger-ink' : 'text-ink')}>
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-ink-muted">{message}</p>
      </div>
    </Modal>
  )
}
