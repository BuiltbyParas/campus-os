import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  CalendarDays,
  CornerDownLeft,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { easeOutSoft } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { buildCommandIndex, searchCommands } from '@/services/commands'
import {
  useCampusContext,
  useEduProgress,
  useExams,
  useFees,
  useResults,
} from '@/services/queries'
import type { CommandItem, CommandKind, SignalTone } from '@/types'

const kindIcon: Record<CommandKind, typeof Search> = {
  action: Zap,
  assistant: Sparkles,
  navigation: ArrowRight,
  info: CalendarDays,
}

const kindLabel: Record<CommandKind, string> = {
  action: 'Action',
  assistant: 'Assistant',
  navigation: 'Go to',
  info: 'Your data',
}

const badgeTone: Record<SignalTone, string> = {
  info: 'bg-surface-muted text-ink-muted',
  ok: 'bg-ok-soft text-ok-ink',
  warn: 'bg-warn-soft text-warn-ink',
  danger: 'bg-danger-soft text-danger-ink',
}

/**
 * The command center.
 *
 * Deliberately not a search box: the index mixes navigation, actions and live
 * answers, so typing "DBMS" returns the attendance figure and the next class
 * time rather than a link to a page about DBMS. That is the difference between
 * finding a department and getting an answer.
 *
 * It is a floating control, which is exactly what the glass material is for.
 */
export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const { attendance, timetable, complaints, deadlines } = useCampusContext()
  const feesQuery = useFees()
  const resultsQuery = useResults()
  const eduQuery = useEduProgress()
  const examsQuery = useExams()

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const index = useMemo(
    () =>
      buildCommandIndex({
        attendance: attendance.data,
        sessions: timetable.data ?? [],
        complaints: complaints.data ?? [],
        deadlines: deadlines.data ?? [],
        fees: feesQuery.data,
        results: resultsQuery.data,
        edu: eduQuery.data,
        exams: examsQuery.data,
      }),
    [
      attendance.data,
      timetable.data,
      complaints.data,
      deadlines.data,
      feesQuery.data,
      resultsQuery.data,
      eduQuery.data,
      examsQuery.data,
    ],
  )

  const results = useMemo(() => searchCommands(index, query), [index, query])

  /* Focus is a real browser side effect, so it belongs in an effect. Resetting
     the query is not — that happens in `close`, the event that causes it. */
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(id)
  }, [open])

  /** Closing clears the query, so the palette never reopens mid-search. */
  function close() {
    setQuery('')
    setActive(0)
    onClose()
  }

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  /* Keep the highlighted row in view while arrowing through a long list. */
  useEffect(() => {
    const node = listRef.current?.children[active] as HTMLElement | undefined
    node?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function run(item: CommandItem) {
    close()
    navigate(item.to)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (results.length === 0 ? 0 : (i + 1) % results.length))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const item = results[active]
      if (item) run(item)
      else if (query.trim()) {
        // Nothing matched — hand the question to the assistant rather than
        // showing a dead end.
        const question = query.trim()
        close()
        navigate(`/app/assistant?q=${encodeURIComponent(question)}`)
      }
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[max(4vh,env(safe-area-inset-top))] sm:px-4 sm:pt-[16vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[8px]"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={close}
          />

          <motion.div
            className="glass-modal relative flex max-h-[86vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl elev-4 sm:max-h-[70vh]"
            initial={reduced ? undefined : { opacity: 0, y: -8, scale: 0.985 }}
            animate={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.2, ease: easeOutSoft }}
            onKeyDown={onKeyDown}
          >
            {/* input */}
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-[18px] shrink-0 text-ink-subtle" aria-hidden />
              <label htmlFor="command-input" className="sr-only">
                Search CampusOS
              </label>
              <input
                id="command-input"
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActive(0)
                }}
                placeholder="What do you need?"
                autoComplete="off"
                spellCheck={false}
                className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-subtle focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-[10.5px] font-medium text-ink-subtle sm:block">
                Esc
              </kbd>
            </div>

            {/* results */}
            {results.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-[14px] text-ink-muted">No matches for “{query}”.</p>
                <p className="mt-1.5 text-[12.5px] text-ink-subtle">
                  Press Enter to ask CampusOS instead.
                </p>
              </div>
            ) : (
              <ul ref={listRef} className="max-h-[46vh] overflow-y-auto p-2" role="listbox">
                {results.map((item, i) => {
                  const Icon = kindIcon[item.kind]
                  const selected = i === active
                  return (
                    <li key={item.id} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        onClick={() => run(item)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          'flex min-h-[48px] w-full items-center gap-3 rounded-tile px-3 py-2.5 text-left transition-colors sm:min-h-0',
                          selected ? 'bg-brand-soft' : 'hover:bg-surface-raised',
                        )}
                      >
                        <Icon
                          className={cn(
                            'size-4 shrink-0',
                            selected ? 'text-brand-ink' : 'text-ink-subtle',
                          )}
                          aria-hidden
                        />

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-medium text-ink">
                            {item.title}
                          </span>
                          {item.subtitle ? (
                            <span className="mt-0.5 block truncate text-[12px] text-ink-subtle">
                              {item.subtitle}
                            </span>
                          ) : null}
                        </span>

                        {item.badge ? (
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums',
                              badgeTone[item.badgeTone ?? 'info'],
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10.5px] uppercase tracking-[0.08em] text-ink-subtle">
                            {kindLabel[item.kind]}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* footer */}
            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
              <span className="hidden items-center gap-3 text-[11px] text-ink-subtle sm:flex">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-line px-1 py-0.5">↑</kbd>
                  <kbd className="rounded border border-line px-1 py-0.5">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="size-3" aria-hidden />
                  open
                </span>
              </span>
              <span className="text-[11px] text-ink-subtle">Demo data</span>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
