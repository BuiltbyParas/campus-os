import { useState, useEffect } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  MapPin,
  Sparkles,
  Calendar,
  AlertTriangle,
  FileText,
  HelpCircle,
  TrendingDown,
  Inbox,
  ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { PageContainer } from '@/components/layout/PageContainer'
import { TodayTimeline } from '@/components/app/TodayTimeline'
import { CampusPulse } from '@/components/app/CampusPulse'
import { ErrorState } from '@/components/ui/States'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { assistantSuggestions, toLocalIsoDate } from '@/data'
import { buildDayAgenda } from '@/lib/agenda'
import { greeting } from '@/lib/utils'
import { sessionsForDay, weekdayFromDate, withStatus } from '@/services/academics'
import { useAnnouncements, useCampusContext, useEvents } from '@/services/queries'
import { buildPulse } from '@/services/signals'

export default function Dashboard() {
  const { student } = useStore()
  const { attendance, timetable, complaints, deadlines, isPending } = useCampusContext()
  const events = useEvents()
  const announcements = useAnnouncements()

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const today = weekdayFromDate(currentTime)
  const isoToday = toLocalIsoDate(currentTime)

  const sessions = withStatus(timetable.data ?? [], currentTime)
  const todaySessions = today ? sessionsForDay(sessions, today) : []

  const agenda = buildDayAgenda({
    sessions: todaySessions,
    deadlines: deadlines.data ?? [],
    events: events.data ?? [],
    isoDate: isoToday,
    at: currentTime,
  })

  const pulse = buildPulse({
    deadlines: deadlines.data ?? [],
    events: events.data ?? [],
    notices: announcements.data ?? [],
    at: currentTime,
  })

  const openRequests = (complaints.data ?? []).filter((item) => item.stage !== 'resolved')

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <PageContainer className="space-y-6 lg:space-y-8">
      {/* ============================================================ SECTION 1: GREETING & STATUS CARD */}
      <div className="relative overflow-hidden rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-gradient-to-r from-[#1a1f2e] to-[#252d3d] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.20),_0_4px_8px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.30)] group">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-[28px] font-bold text-white tracking-[-0.25px]">
              {greeting(currentTime)}, {student.name.split(' ')[0]}
            </h1>
            <p className="mt-1 text-[14px] text-[#a0aec0]">
              {formattedDate} • {formattedTime}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <span className="text-[24px] font-bold text-[#6366f1] tracking-tight">
              4h 24m
            </span>
            <span className="text-[13px] text-[#64748b]">until next class</span>
          </div>
        </div>

        {/* Bottom stat summary line */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[rgba(255,255,255,0.05)] pt-4 text-[13px] text-[#a0aec0]">
          <Link to="/app/timetable" className="hover:text-[#6366f1] hover:underline transition-colors">
            2 classes today
          </Link>
          <span className="text-[#64748b]">•</span>
          <Link to="/app/timetable" className="hover:text-[#6366f1] hover:underline transition-colors">
            1 deadline
          </Link>
          <span className="text-[#64748b]">•</span>
          <Link to="/app/attendance" className="text-[#ef4444] font-medium hover:underline transition-colors">
            72% DBMS
          </Link>
          <span className="text-[#64748b]">•</span>
          <Link to="/app/complaints" className="hover:text-[#6366f1] hover:underline transition-colors">
            {openRequests.length || 3} active requests
          </Link>
        </div>
      </div>

      {/* ============================================================ SECTION 2: NEXT CLASS HERO */}
      <div className="relative overflow-hidden rounded-[12px] border border-white/15 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] p-6 shadow-[0_16px_40px_rgba(99,102,241,0.25)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(99,102,241,0.4)] [transform-style:preserve-3d] hover:[transform:perspective(1000px)_rotateY(1deg)_rotateX(1deg)] flex flex-col justify-between md:flex-row md:items-center">
        <div className="space-y-3 md:w-3/5">
          <div className="inline-block text-[11px] font-bold uppercase tracking-[0.5px] text-white/70">
            NEXT CLASS
          </div>
          <h2 className="text-[28px] font-bold text-white tracking-[-0.25px]">
            Computer Networks
          </h2>
          <p className="text-[15px] text-white/85">
            Starts in 4h 24m • Nothing scheduled until then
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-white">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-white/80" />
              <span className="text-[16px] font-bold">9 AM - 10 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-white/80" />
              <span className="text-[14px] text-white/80">Block 34 • Room 118</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/app/timetable"
              className="inline-flex items-center gap-1 text-[14px] font-semibold text-white hover:underline"
            >
              View timetable →
            </Link>
          </div>
        </div>

        <div className="mt-4 md:mt-0 md:w-2/5 flex flex-col items-start md:items-end justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md border border-white/20">
            <span className="size-2 rounded-full bg-[#10b981] animate-pulse" />
            Starting soon
          </span>
        </div>
      </div>

      {/* ============================================================ SECTION 4: STATS ROW */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="flex flex-col justify-between rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-1.5 hover:border-[rgba(99,102,241,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.20)] group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#64748b]">
              Classes Today
            </span>
            <span className="text-[20px] text-[#3b82f6] group-hover:scale-110 transition-transform">
              📚
            </span>
          </div>
          <div className="my-2 text-[32px] font-bold text-white group-hover:text-[#3b82f6] transition-colors">
            2
          </div>
          <div className="text-[13px] text-[#a0aec0]">Both in the morning</div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-1.5 hover:border-[rgba(99,102,241,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.20)] group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#64748b]">
              Deadline Today
            </span>
            <span className="text-[20px] text-[#f59e0b] group-hover:scale-110 transition-transform">
              ⏰
            </span>
          </div>
          <div className="my-2 text-[32px] font-bold text-[#6366f1] group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all">
            1
          </div>
          <div className="text-[13px] text-[#a0aec0]">ER diagram assignment</div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-1.5 hover:border-[rgba(99,102,241,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.20)] group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#64748b]">
              DBMS Attendance
            </span>
            <span className="text-[20px] text-[#ef4444] group-hover:scale-110 transition-transform">
              📊
            </span>
          </div>
          <div className="my-2 text-[32px] font-bold text-[#ef4444]">
            72%
          </div>
          <div className="text-[13px] text-[#ef4444]/90">Below 75% threshold</div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col justify-between rounded-[12px] border border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-1.5 hover:border-[rgba(99,102,241,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.20)] group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#64748b]">
              Active Requests
            </span>
            <span className="text-[20px] text-[#a855f7] group-hover:scale-110 transition-transform">
              📩
            </span>
          </div>
          <div className="my-2 text-[32px] font-bold text-[#6366f1]">
            {openRequests.length || 3}
          </div>
          <div className="text-[13px] text-[#a0aec0]">Awaiting responses</div>
        </div>
      </div>

      {/* ============================================================ SECTION 5: NEEDS ATTENTION SECTION */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-white tracking-tight">Needs attention</h2>
            <p className="text-[12px] text-[#64748b]">Critical items requiring prompt action</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Alert 1: Attendance */}
          <div className="flex flex-col justify-between rounded-r-[12px] border-l-4 border-[#ef4444] border-y border-r border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-1.5 hover:border-l-[5px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.20)] group">
            <div className="flex gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ef4444]/20 text-[#ef4444] group-hover:scale-110 transition-transform">
                <AlertTriangle className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#ef4444]">
                  ATTENDANCE
                </span>
                <h3 className="mt-1 text-[16px] font-bold text-white">DBMS attendance is 72%</h3>
                <p className="mt-1 text-[13px] text-[#a0aec0] line-clamp-2">
                  Below the 75% threshold. Attending the next 3 brings it back.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-white/5">
              <Link to="/app/attendance" className="text-[13px] font-semibold text-[#6366f1] group-hover:underline">
                View attendance →
              </Link>
            </div>
          </div>

          {/* Alert 2: Assignment */}
          <div className="flex flex-col justify-between rounded-r-[12px] border-l-4 border-[#f59e0b] border-y border-r border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-1.5 hover:border-l-[5px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.20)] group">
            <div className="flex gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f59e0b]/20 text-[#f59e0b] group-hover:scale-110 transition-transform">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#f59e0b]">
                  COURSEWORK
                </span>
                <h3 className="mt-1 text-[16px] font-bold text-white">Assignment due in 9h 10m</h3>
                <p className="mt-1 text-[13px] text-[#a0aec0] line-clamp-2">
                  ER diagram & normalisation worksheet • DBMS
                </p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-white/5">
              <Link to="/app/timetable" className="text-[13px] font-semibold text-[#6366f1] group-hover:underline">
                View timetable →
              </Link>
            </div>
          </div>

          {/* Alert 3: Examination */}
          <div className="flex flex-col justify-between rounded-r-[12px] border-l-4 border-[#eab308] border-y border-r border-[rgba(99,102,241,0.15)] bg-[#1a1f2e] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-1.5 hover:border-l-[5px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.20)] group">
            <div className="flex gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eab308]/20 text-[#eab308] group-hover:scale-110 transition-transform">
                <Calendar className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#eab308]">
                  EXAMINATION
                </span>
                <h3 className="mt-1 text-[16px] font-bold text-white">DBMS end-term in 6 days</h3>
                <p className="mt-1 text-[13px] text-[#a0aec0] line-clamp-2">
                  10 AM • Block 34 • Room 204 • Seat B-12
                </p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-white/5">
              <Link to="/app/examinations" className="text-[13px] font-semibold text-[#6366f1] group-hover:underline">
                View exams →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ SECTION 6: TIMELINE & SCHEDULE / RIGHT RAIL */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-[12px] border border-[rgba(99,102,241,0.1)] bg-[#1a1f2e] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-white tracking-tight">Your day</h2>
              <Link
                to="/app/timetable"
                className="text-[14px] font-semibold text-[#6366f1] hover:underline"
              >
                Full week →
              </Link>
            </div>

            {timetable.isPending ? (
              <SkeletonRows count={3} />
            ) : (
              <TodayTimeline items={agenda} />
            )}
          </section>

          {/* Recent Requests */}
          <section className="rounded-[12px] border border-[rgba(99,102,241,0.1)] bg-[#1a1f2e] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-white tracking-tight">Recent activity</h2>
              <Link
                to="/app/complaints"
                className="text-[14px] font-semibold text-[#6366f1] hover:underline"
              >
                All requests →
              </Link>
            </div>

            {complaints.isPending ? (
              <SkeletonRows count={2} />
            ) : openRequests.length === 0 ? (
              <div className="rounded-[8px] border border-dashed border-white/10 p-6 text-center text-[#a0aec0]">
                No outstanding requests
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {openRequests.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    to={`/app/complaints/${item.id}`}
                    className="flex items-center justify-between py-3 hover:bg-white/[0.02] px-2 rounded transition-colors group"
                  >
                    <div>
                      <div className="text-[14px] font-medium text-white group-hover:text-[#6366f1]">
                        {item.title}
                      </div>
                      <div className="text-[12px] text-[#64748b]">
                        {item.reference} • {item.category}
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-[#64748b] group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Rail: AI Assistant & Campus Pulse */}
        <div className="space-y-6">
          {/* Assistant Quick Box */}
          <div className="rounded-[12px] border border-[rgba(99,102,241,0.2)] bg-gradient-to-br from-[#1a1f2e] to-[#252d3d] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.20)]">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-full bg-[#6366f1] text-white">
                <Sparkles className="size-4" />
              </div>
              <h3 className="text-[16px] font-bold text-white">AI Assistant</h3>
            </div>
            <p className="mt-2 text-[13px] text-[#a0aec0]">
              Query your attendance, schedule, or submit requests instantly.
            </p>

            <div className="mt-4 space-y-2">
              {assistantSuggestions.slice(0, 3).map((suggestion) => (
                <Link
                  key={suggestion}
                  to={`/app/assistant?q=${encodeURIComponent(suggestion)}`}
                  className="block rounded-[8px] border border-white/5 bg-white/[0.03] p-2.5 text-[13px] text-[#a0aec0] hover:border-[rgba(99,102,241,0.3)] hover:text-white transition-all"
                >
                  "{suggestion}"
                </Link>
              ))}
            </div>

            <Link
              to="/app/assistant"
              className="mt-5 flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[#6366f1] text-[14px] font-semibold text-white hover:brightness-110 shadow-[0_4px_12px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02]"
            >
              Open Assistant
            </Link>
          </div>

          {/* Campus Pulse */}
          <div className="rounded-[12px] border border-[rgba(99,102,241,0.1)] bg-[#1a1f2e] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-white">Campus Pulse</h3>
              <Link to="/app/events" className="text-[12px] font-semibold text-[#6366f1] hover:underline">
                View all
              </Link>
            </div>
            <CampusPulse items={pulse.slice(0, 4)} />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

