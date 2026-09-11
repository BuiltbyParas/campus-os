import { Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

/**
 * The assistant's floating entry point.
 *
 * It earns the glass treatment: it hovers above every screen and follows the
 * student around. It hides on the assistant screen itself, where it would be a
 * button that goes nowhere.
 */
export function AssistantLauncher() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/app/assistant')) return null

  return (
    <Link
      to="/app/assistant"
      aria-label="Ask the CampusOS assistant"
      className="glass press fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex size-13 items-center justify-center gap-2 rounded-full text-[13.5px] font-medium text-ink sm:size-auto sm:py-3 sm:pl-3.5 sm:pr-4 lg:bottom-6 lg:right-6"
    >
      <Sparkles className="size-[19px] shrink-0 text-brand-ink" aria-hidden />
      <span className="hidden sm:inline">Ask CampusOS</span>
    </Link>
  )
}
