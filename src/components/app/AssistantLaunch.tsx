import { ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { assistantSuggestions } from '@/data'
import { cn } from '@/lib/utils'

/**
 * The way into CampusOS AI from the dashboard.
 *
 * A block of prose explaining that an assistant exists is the weakest possible
 * version of this: it describes a capability instead of offering it. This is a
 * real composer — type a question and land in the conversation with it already
 * asked — wrapped in the glass material, which is what that material is for.
 *
 * The placeholder cycles through the questions the assistant can genuinely
 * answer from records, so the surface teaches its own vocabulary without a
 * paragraph of instructions.
 */
export function AssistantLaunch({ className }: { className?: string }) {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [hint, setHint] = useState(0)
  const [focused, setFocused] = useState(false)

  /* The cycling stops the moment the student engages — a placeholder that
     changes under a cursor is a distraction, not a hint. */
  useEffect(() => {
    if (focused || question) return
    const id = window.setInterval(
      () => setHint((value) => (value + 1) % assistantSuggestions.length),
      3800,
    )
    return () => window.clearInterval(id)
  }, [focused, question])

  function ask(text: string) {
    const trimmed = text.trim()
    if (!trimmed) {
      navigate('/app/assistant')
      return
    }
    navigate(`/app/assistant?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <section
      className={cn(
        'glass relative overflow-hidden rounded-card p-5',
        className,
      )}
    >
      {/* light pooled behind the panel, so the glass has something to refract */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-brand/25 blur-[70px]"
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-brand/15">
            <Sparkles className="size-4 text-brand-ink" aria-hidden />
          </span>
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Ask CampusOS</h2>
        </div>

        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault()
            ask(question)
          }}
        >
          <label htmlFor="dash-ask" className="sr-only">
            Ask CampusOS a question
          </label>
          <div
            className={cn(
              'flex items-center gap-2 rounded-control border bg-canvas/50 pl-3 pr-1.5 transition-[border-color,box-shadow] duration-200',
              focused ? 'border-brand-border shadow-[0_0_0_3px_var(--brand-soft)]' : 'border-line',
            )}
          >
            <input
              id="dash-ask"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={assistantSuggestions[hint]}
              autoComplete="off"
              className="h-10 min-w-0 flex-1 bg-transparent text-[13.5px] text-ink placeholder:text-ink-subtle/80 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Ask CampusOS"
              className="press grid size-10 shrink-0 place-items-center rounded-md bg-brand text-on-brand transition-colors hover:bg-brand-hover sm:size-8"
            >
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </form>

        {/* Two starters, as chips rather than a list — they are things to press,
            not things to read. */}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {assistantSuggestions.slice(0, 2).map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => ask(suggestion)}
                className="press rounded-full border border-line bg-surface/50 px-3 py-2.5 text-left text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink sm:px-2.5 sm:py-1.5"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-3.5 text-[11.5px] leading-snug text-ink-subtle">
          Reads your timetable, attendance, marks and fees before answering — and shows which
          records it used.
        </p>

        <Link
          to="/app/assistant"
          className="tap mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-ink transition-colors hover:text-ink"
        >
          Open the assistant
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
