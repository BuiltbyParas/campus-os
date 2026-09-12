import { ArrowUp, Clock, FileText, Calendar, Star, CheckCircle, RotateCcw, Sparkles, Send, HelpCircle, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useStore } from '@/app/store'
import { PageContainer } from '@/components/layout/PageContainer'
import { DemoTag } from '@/components/ui/DemoTag'
import { cn, uid } from '@/lib/utils'
import { ask } from '@/services/assistant'
import type { AssistantDataPoint, AssistantSource, ChatMessage } from '@/types'

const questionCards = [
  { text: 'Can I skip DBMS?', icon: Clock, subtext: 'Check threshold & impact' },
  { text: 'How is my attendance?', icon: CheckCircle, subtext: 'Overview across all subjects' },
  { text: 'What does my day look like?', icon: Calendar, subtext: 'Today’s sessions & rooms' },
  { text: 'What coursework is due?', icon: FileText, subtext: 'Upcoming assignment deadlines' },
  { text: 'When is my next exam?', icon: Clock, subtext: 'Seat & syllabus schedule' },
  { text: 'What are my grades?', icon: Star, subtext: 'Assessments and CA scores' },
]

function DataStrip({ data }: { data: AssistantDataPoint[] }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-2 overflow-hidden rounded-[8px] border border-white/5 bg-black/20 p-2 sm:grid-cols-4">
      {data.map((point) => (
        <div key={point.label} className="bg-[#1a1f2e] p-2.5 rounded">
          <dt className="text-[11px] text-[#64748b]">{point.label}</dt>
          <dd className="mt-1 text-[15px] font-bold text-white tabular-nums">
            {point.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Sources({ sources }: { sources: AssistantSource[] }) {
  return (
    <div className="mt-4 border-t border-white/5 pt-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748b]">
        Connected Records
      </p>
      <ul className="space-y-1.5">
        {sources.map((source) => (
          <li key={`${source.kind}-${source.label}`} className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded border border-[rgba(99,102,241,0.2)] bg-[#6366f1]/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-[#6366f1]">
              {source.kind}
            </span>
            <span className="text-[12.5px] text-[#a0aec0]">{source.detail}</span>
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
        <div className="max-w-[80%] rounded-[12px] bg-[#6366f1] px-4 py-3 text-[14px] leading-relaxed text-white shadow-md">
          {message.content}
        </div>
      </li>
    )
  }

  return (
    <li className="flex gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#6366f1]/20 text-[#6366f1]">
        <Sparkles className="size-4" />
      </div>

      <div className="min-w-0 flex-1 rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#252d3d] p-4 text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
        {message.pending ? (
          <div className="space-y-2">
            <p className="text-[13px] text-[#a0aec0]">Checking records…</p>
            <div className="flex gap-1.5">
              {['Attendance', 'Timetable', 'Coursework', 'Requests'].map((source) => (
                <span key={source} className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-[#64748b] animate-pulse">
                  {source}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="text-[14px] leading-relaxed">{message.content}</p>
            {message.data && message.data.length > 0 && <DataStrip data={message.data} />}
            {message.sources && message.sources.length > 0 && <Sources sources={message.sources} />}
            {message.actions && message.actions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {message.actions.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="inline-flex items-center rounded-[6px] border border-[rgba(99,102,241,0.3)] bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-[#6366f1] hover:bg-white/10"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </li>
  )
}

export default function Assistant() {
  const { student } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()

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
    setMessages((prev) => [
      ...prev,
      { id: uid('msg'), role: 'user', content: trimmed },
      { id: pendingId, role: 'assistant', content: '', pending: true },
    ])

    try {
      const answer = await ask(trimmed)
      setMessages((prev) => prev.map((message) => (message.id === pendingId ? answer : message)))
    } catch {
      setMessages((prev) => prev.filter((message) => message.id !== pendingId))
      setError('The assistant could not reach your campus data. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const question = searchParams.get('q')
    if (!question) return
    setSearchParams({}, { replace: true })
    void send(question)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void send(input)
  }

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(99,102,241,0.1)] pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight">AI Assistant</h1>
          <p className="text-[14px] text-[#a0aec0]">
            Direct intelligence powered by your attendance, grades, and schedule.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 rounded-[8px] border border-white/10 px-3 py-1.5 text-[13px] text-[#a0aec0] hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            Reset Chat
          </button>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Column: Chat or Suggestions Grid */}
        <div className="flex flex-col min-h-[500px]">
          {messages.length === 0 ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-[18px] font-semibold text-white mb-1">Recommended Inquiries</h2>
                <p className="text-[13px] text-[#64748b]">Click any query to evaluate records immediately</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {questionCards.map((card) => (
                  <button
                    key={card.text}
                    onClick={() => void send(card.text)}
                    className="flex flex-col justify-between rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-4 text-left shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-2 hover:border-[rgba(99,102,241,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.20)] group cursor-pointer"
                  >
                    <div>
                      <card.icon className="size-6 text-[#6366f1] group-hover:scale-115 transition-transform" />
                      <h3 className="mt-3 text-[14px] font-bold text-white group-hover:text-[#6366f1] transition-colors">
                        {card.text}
                      </h3>
                      <p className="mt-1 text-[12px] text-[#64748b]">{card.subtext}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-[#6366f1] opacity-0 group-hover:opacity-100 transition-opacity">
                      Ask now <ArrowRight className="size-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 max-h-[600px]">
              {messages.map((m) => (
                <Bubble key={m.id} message={m} />
              ))}
              <div ref={endRef} />
            </ul>
          )}

          {/* Chat Composer */}
          <form onSubmit={handleSubmit} className="mt-auto pt-4">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about attendance, classes, exams, marks or fees..."
                className="h-[56px] w-full rounded-[12px] border border-[rgba(99,102,241,0.2)] bg-[#1a1f2e] pl-4 pr-16 text-[14px] text-white placeholder:text-[#64748b] focus:border-[#6366f1] focus:outline-none focus:shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                className="absolute right-2 grid size-10 place-items-center rounded-full bg-[#6366f1] text-white hover:scale-105 active:scale-95 disabled:opacity-40 transition-all shadow-[0_0_8px_rgba(99,102,241,0.4)]"
              >
                <Send className="size-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Connected Records Sidebar */}
        <aside className="rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] h-fit space-y-4">
          <div className="border-b border-white/5 pb-3">
            <div className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#64748b]">
              Connected Records
            </div>
            <p className="text-[11px] text-[#a0aec0] mt-0.5">Live sync with Student ERP</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02]">
              <span className="text-[13px] text-[#a0aec0]">Today's Classes</span>
              <span className="text-[16px] font-bold text-white">2</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02]">
              <span className="text-[13px] text-[#a0aec0]">Overall Attendance</span>
              <span className="text-[16px] font-bold text-[#10b981]">80%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02]">
              <span className="text-[13px] text-[#a0aec0]">Assignments Due</span>
              <span className="text-[16px] font-bold text-[#f59e0b]">1</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02]">
              <span className="text-[13px] text-[#a0aec0]">Next Exam</span>
              <span className="text-[16px] font-bold text-[#6366f1]">6 days</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02]">
              <span className="text-[13px] text-[#a0aec0]">Open Requests</span>
              <span className="text-[16px] font-bold text-white">3</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02]">
              <span className="text-[13px] text-[#a0aec0]">Pending Fees</span>
              <span className="text-[16px] font-bold text-[#ef4444]">₹1,500</span>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  )
}

