import { Download, Share, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { haptic } from '@/lib/haptics'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * "Add CampusOS to your home screen."
 *
 * Installed, the app opens standalone on its own dark canvas with no browser
 * chrome — which is the difference between a link someone was sent once and
 * something they open every morning. The manifest and icons are already
 * shipped; this is the invitation.
 *
 * Two platforms, two mechanisms. Chrome and Edge fire `beforeinstallprompt`,
 * which can be deferred and replayed on a tap. iOS Safari fires nothing and
 * has no API at all, so the only honest thing to do there is show the two
 * steps — Share, then Add to Home Screen — rather than a button that cannot
 * work.
 *
 * It asks once. A dismissal is remembered, because an install banner that
 * returns is an advert.
 */

const DISMISSED_KEY = 'campusos.install.dismissed'

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS reports this on `navigator` rather than through a media query.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIosSafari() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

export function InstallPrompt() {
  const isPhone = useMediaQuery('(max-width: 767px)')
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISSED_KEY) === '1')
    } catch {
      setDismissed(false)
    }

    if (isStandalone()) {
      setDismissed(true)
      return
    }

    const onPrompt = (e: Event) => {
      /* Deferring it is the whole point: the browser's own moment to ask is
         rarely the user's, and once prevented the event can be replayed
         whenever we like. */
      e.preventDefault()
      setEvent(e as InstallEvent)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)

    /* iOS never fires the event, so the hint is offered on a delay instead —
       long enough that it lands after the student has seen the product. */
    const timer = window.setTimeout(() => {
      if (isIosSafari() && !isStandalone()) setShowIosHint(true)
    }, 12_000)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.clearTimeout(timer)
    }
  }, [])

  function close() {
    haptic('tick')
    setEvent(null)
    setShowIosHint(false)
    setDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      /* A private window cannot remember the dismissal. Showing it again
         next session is a smaller failure than crashing the shell. */
    }
  }

  async function install() {
    if (!event) return
    haptic('select')
    await event.prompt()
    await event.userChoice
    close()
  }

  if (dismissed || !isPhone || (!event && !showIosHint)) return null

  return (
    <div className="fixed inset-x-3 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 md:hidden">
      <div className="card-premium flex items-start gap-3 p-4 elev-4">
        <span className="grad-accent grid size-11 shrink-0 place-items-center rounded-tile text-on-brand">
          <Download className="size-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-ink">Add CampusOS to your home screen</p>
          {event ? (
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-subtle">
              Opens full screen, like an app — no browser bars.
            </p>
          ) : (
            <p className="mt-1 flex flex-wrap items-center gap-1 text-[12.5px] leading-relaxed text-ink-subtle">
              Tap
              <Share className="inline size-3.5 text-brand-ink" aria-label="the Share button" />
              then <span className="font-semibold text-ink-muted">Add to Home Screen</span>.
            </p>
          )}

          {event ? (
            <button
              type="button"
              onClick={install}
              className="grad-accent press-spring mt-3 inline-flex min-h-[40px] items-center rounded-control px-4 text-[13px] font-semibold text-on-brand"
            >
              Install
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Dismiss install prompt"
          className="-m-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-faint active:bg-brand-soft"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
