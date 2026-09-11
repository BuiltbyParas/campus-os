import { ArrowUp, Sparkles } from 'lucide-react'
import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { GlassPanel } from '@/components/ui/GlassPanel'
import { assistantSuggestions } from '@/data'
import { cn } from '@/lib/utils'
import { ask } from '@/services/assistant'
import type { ChatMessage, AssistantDataPoint } from '@/types'

const toneClass: Record<NonNullable<AssistantDataPoint['tone']>, string> = {
  neutral: 'text-ink',
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  danger: 'text-danger-ink',
}

export function MiniAssistant() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [lastExchange, setLastExchange] = useState<{ question: string; answer?: ChatMessage } | null>(null)

  useEffect(() => {
    // Show 2 initial rotating prompt suggestion pills
    const shuffled = [...assistantSuggestions].sort(() => 0.5 - Math.random())
    setSuggestions(shuffled.slice(0, 2))
  }, [])

  async function send(question: string) {
    const trimmed = question.trim()
    if (!trimmed || busy) return

    setInput('')
    setBusy(true)
    setLastExchange({ question: trimmed })

    try {
      const answer = await ask(trimmed)
      setLastExchange({ question: trimmed, answer })
    } catch {
      // In a real app we'd handle error state here, for now it just stops spinning
    } finally {
      setBusy(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void send(input)
  }

  return (
    <GlassPanel className="rounded-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft">
          <Sparkles className="size-3.5 text-brand-ink" aria-hidden />
        </span>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">Ask CampusOS</h2>
      </div>

      <div className="mb-5">
        {!lastExchange ? (
          <div className="flex flex-col gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => void send(suggestion)}
                className="press rounded-control border border-line bg-surface-raised px-3.5 py-2.5 text-left text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-brand px-3.5 py-2 text-[13.5px] leading-relaxed text-on-brand">
              {lastExchange.question}
            </div>

            {busy && !lastExchange.answer ? (
              <div className="flex items-center gap-2.5 text-ink-muted">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft animate-pulse">
                  <Sparkles className="size-3 text-brand-ink" aria-hidden />
                </span>
                <span className="text-[13px]">Thinking…</span>
              </div>
            ) : lastExchange.answer ? (
              <div className="flex flex-col gap-2.5">
                <p className="line-clamp-3 text-[13.5px] leading-relaxed text-ink">
                  {lastExchange.answer.content}
                </p>
                
                {lastExchange.answer.data && lastExchange.answer.data.length > 0 ? (
                  <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-control border border-line bg-line">
                    {lastExchange.answer.data.slice(0, 4).map((point, idx) => (
                      <div key={idx} className="bg-surface px-2.5 py-2">
                        <dt className="text-[10.5px] text-ink-subtle">{point.label}</dt>
                        <dd
                          className={cn(
                            'mt-0.5 text-[13px] font-semibold tabular-nums',
                            toneClass[point.tone ?? 'neutral']
                          )}
                        >
                          {point.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <Link
                  to={`/app/assistant?q=${encodeURIComponent(lastExchange.question)}`}
                  className="press inline-flex w-max items-center text-[12.5px] font-medium text-brand-ink hover:underline"
                >
                  See full answer →
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative mb-4 flex items-center">
        <label htmlFor="mini-assistant-input" className="sr-only">Ask the assistant</label>
        <input
          id="mini-assistant-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder="Ask about attendance or classes…"
          autoComplete="off"
          className="h-10 w-full min-w-0 rounded-control border border-line bg-surface px-3 pr-10 text-[13px] text-ink placeholder:text-ink-subtle focus:border-brand-border focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          aria-label="Send question"
          className="press absolute right-1 grid size-8 shrink-0 place-items-center rounded bg-brand text-on-brand transition-opacity disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowUp className="size-[15px]" aria-hidden />
        </button>
      </form>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <Link
          to="/app/assistant"
          className="press text-[12.5px] font-medium text-ink-muted transition-colors hover:text-brand-ink"
        >
          Open full assistant →
        </Link>
        <span className="text-[11px] text-ink-subtle">
          Demo answers · records labelled DEMO
        </span>
      </div>
    </GlassPanel>
  )
}
