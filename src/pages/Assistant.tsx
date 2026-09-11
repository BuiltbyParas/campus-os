import { ArrowUp, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useStore } from '@/app/store'
import { AssistantContext } from '@/components/app/AssistantContext'
import { PageContainer } from '@/components/layout/PageContainer'
import { DemoTag } from '@/components/ui/DemoTag'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { assistantSuggestions } from '@/data'
import { cn, uid } from '@/lib/utils'
import { chat } from '@/services/ai'
import { useToday } from '@/services/queries'
import type { AssistantDataPoint, AssistantSource, ChatMessage } from '@/types'

/* ------------------------------------------------------------- fragments */

const toneClass: Record<NonNullable<AssistantDataPoint['tone']>, string> = {
  neutral: 'text-ink',
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  danger: 'text-danger-ink',
}

const sourceLabel: Record<AssistantSource['kind'], string> = {
  attendance: 'Attendance',
  timetable: 'Timetable',
  complaints: 'Requests',
  policy: 'Policy',
}

/**
 * The figures behind an answer.
 *
 * Showing the arithmetic is the point: a student should be able to check the
 * assistant's reasoning rather than take "you're at 72%" on trust.
 */
function DataStrip({ data }: { data: AssistantDataPoint[] }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-tile border border-line bg-line sm:grid-cols-4">
      {data.map((point) => (
        <div key={point.label} className="bg-surface px-3 py-2.5">
          <dt className="text-[11px] text-ink-subtle">{point.label}</dt>
          <dd
            className={cn(
              'mt-1 text-[15px] font-semibold tabular-nums',
              toneClass[point.tone ?? 'neutral'],
            )}
          >
            {point.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Where each part of an answer came from. A `demo` source is marked, so a demo
 * rule can never be mistaken for an institutional one.
 */
function Sources({ sources }: { sources: AssistantSource[] }) {
  return (
    <div className="mt-4 border-t border-line pt-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-subtle">
        Based on
      </p>
      <ul className="space-y-1.5">
        {sources.map((source) => (
          <li key={`${source.kind}-${source.label}`} className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded border border-line px-1.5 py-0.5 text-[10.5px] font-medium text-ink-muted">
              {sourceLabel[source.kind]}
            </span>
            <span className="text-[12.5px] text-ink-muted">{source.detail}</span>
            {source.source === 'demo' ? <DemoTag /> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Bubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <li className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[14.5px] leading-relaxed text-on-brand">
          {message.content}
        </div>
      </li>
    )
  }

  return (
    <li>
      <div className="flex gap-3">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft">
          <Sparkles className="size-3.5 text-brand-ink" aria-hidden />
        </span>

        <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-line bg-surface p-4">
          {message.pending ? (
            <div aria-label="Checking your records">
              <p className="text-[13px] text-ink-muted">Checking your records…</p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {['Attendance', 'Timetable', 'Coursework', 'Requests'].map((source, i) => (
                  <li
                    key={source}
                    className="animate-pulse rounded border border-line px-1.5 py-0.5 text-[10.5px] font-medium text-ink-subtle"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <p className="text-[14.5px] leading-relaxed text-ink">{message.content}</p>

              {message.data && message.data.length > 0 ? <DataStrip data={message.data} /> : null}
              {message.sources && message.sources.length > 0 ? (
                <Sources sources={message.sources} />
              ) : null}

              {message.actions && message.actions.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.actions.map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="press inline-flex items-center rounded-control border border-line bg-surface-raised px-3 py-1.5 text-[12.5px] font-medium text-ink hover:border-line-strong"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </li>
  )
}

/* ------------------------------------------------------------------ page */

export default function Assistant() {
  const { student } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { view, isPending: contextPending } = useToday(new Date())

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function send(question: string) {
    const trimmed = question.trim()
    if (!trimmed || busy) return

    setError(null)
    setInput('')
    setBusy(true)

    const pendingId = uid('pending')
    /* Captured before the optimistic messages are appended, so the backend
       receives the conversation as it stood when the question was asked. */
    const history = messages
      .filter((message) => !message.pending && message.content.trim().length > 0)
      .map((message) => ({ role: message.role, content: message.content }))

    setMessages((prev) => [
      ...prev,
      { id: uid('msg'), role: 'user', content: trimmed },
      { id: pendingId, role: 'assistant', content: '', pending: true },
    ])

    try {
      const answer = await chat(trimmed, history)
      setMessages((prev) => prev.map((message) => (message.id === pendingId ? answer : message)))
    } catch {
      setMessages((prev) => prev.filter((message) => message.id !== pendingId))
      setError('The assistant could not reach your campus data. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  /* A suggestion followed from the dashboard arrives as ?q= and asks itself. */
  useEffect(() => {
    const question = searchParams.get('q')
    if (!question) return
    setSearchParams({}, { replace: true })
    void send(question)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void send(input)
  }

  const empty = messages.length === 0

  /* Most recent first, de-duplicated — a student who asked the same thing twice
     does not want it listed twice. */
  const asked = Array.from(
    new Set(
      messages
        .filter((message) => message.role === 'user')
        .map((message) => message.content)
        .reverse(),
    ),
  ).slice(0, 4)

  return (
    <PageContainer className="flex min-h-[calc(100dvh-13rem)] flex-col">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[32px]">
            Intelligence
          </h1>
          <p className="mt-1.5 text-[14.5px] text-ink-muted">
            Answers built from {student.name.split(' ')[0]}’s own campus records — and it shows
            you which ones it used.
          </p>
        </div>

        {!empty ? (
          <button
            type="button"
            onClick={() => {
              setMessages([])
              setError(null)
              inputRef.current?.focus()
            }}
            className="press inline-flex shrink-0 items-center gap-1.5 rounded-control border border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink-muted hover:border-line-strong hover:text-ink"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Clear
          </button>
        ) : null}
      </header>

      {/* ------------------------------------------------------------ workspace
          The rail is not decoration: it shows what the assistant can read
          before a question is asked, which is the difference between a chatbot
          and something wired into the campus. It sits above the conversation on
          narrow screens, beside it once there is room. */}
      <div className="mt-6 flex flex-1 flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_268px] xl:items-start xl:gap-8">
        <div className="flex min-w-0 flex-1 flex-col xl:order-1">
          <div className="flex-1">
            {empty ? (
              <div className="rounded-card border border-line bg-surface p-6 sm:p-8">
                <span className="grid size-10 place-items-center rounded-full bg-brand-soft">
                  <Sparkles className="size-5 text-brand-ink" aria-hidden />
                </span>
                <h2 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">
                  What would you like to know?
                </h2>
                <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-ink-muted">
                  The assistant reads your own campus records and shows the figures behind every
                  answer. It never states a university policy as fact — demo rules are labelled.
                </p>

                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {assistantSuggestions.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        onClick={() => void send(suggestion)}
                        className="press h-full w-full rounded-control border border-line bg-surface-raised px-3.5 py-3 text-left text-[13.5px] text-ink-muted hover:border-line-strong hover:text-ink"
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="space-y-5">
                {messages.map((message) => (
                  <Bubble key={message.id} message={message} />
                ))}
              </ul>
            )}

            {error ? (
              <p role="alert" className="mt-4 text-[13.5px] text-danger-ink">
                {error}
              </p>
            ) : null}

            <div ref={endRef} />
          </div>

          {/* ---------------------------------------------------------- composer */}
          <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 mt-6 lg:bottom-6">
            <GlassPanel as="form" onSubmit={handleSubmit} className="rounded-2xl p-2">
              <div className="flex items-center gap-2">
                <label htmlFor="assistant-input" className="sr-only">
                  Ask the assistant
                </label>
                <input
                  id="assistant-input"
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about attendance, classes, exams, marks or fees…"
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 bg-transparent px-3 text-[14.5px] text-ink placeholder:text-ink-subtle focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || busy}
                  aria-label="Send question"
                  className="press grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-on-brand transition-opacity disabled:pointer-events-none disabled:opacity-40"
                >
                  <ArrowUp className="size-[18px]" aria-hidden />
                </button>
              </div>
            </GlassPanel>

            <p className="mt-2 px-1 text-center text-[11.5px] text-ink-subtle">
              Demo assistant · answers are generated from demo campus records
            </p>
          </div>
        </div>

        {/* context rail */}
        <div className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:order-2">
          <AssistantContext view={view} isPending={contextPending} />

          {/* Asked already this session — one tap to re-run a question rather
              than retyping it. Only appears once there is history to offer. */}
          {asked.length > 0 ? (
            <div className="rounded-card border border-line bg-surface p-4">
              <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                Asked this session
              </h2>
              <ul className="mt-3 space-y-1.5">
                {asked.map((question) => (
                  <li key={question}>
                    <button
                      type="button"
                      onClick={() => void send(question)}
                      className="w-full truncate rounded-tile px-2 py-1.5 text-left text-[12.5px] text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
                    >
                      {question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}
