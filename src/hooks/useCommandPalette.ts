import { useCallback, useEffect, useState } from 'react'

/**
 * Owns the ⌘K / Ctrl+K shortcut.
 *
 * The handler deliberately ignores the shortcut while the student is typing in
 * a field, so it can never swallow a keystroke meant for the assistant composer
 * or the complaint form.
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((value) => !value), [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return

      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable === true

      // ⌘K from inside the palette's own input should still close it.
      if (typing && target?.id !== 'command-input') return

      event.preventDefault()
      setOpen((value) => !value)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return { open, setOpen, close, toggle }
}
