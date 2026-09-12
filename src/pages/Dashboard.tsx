import { useStore } from '@/app/store'
import { AssistantLaunch } from '@/components/app/AssistantLaunch'
import { AttentionStack } from '@/components/app/AttentionStack'
import { CampusPulse } from '@/components/app/CampusPulse'
import {
  Greeting,
  SectionTitle,
  StatCard,
  buildStats,
} from '@/components/app/DashboardStats'
import { DayAxis } from '@/components/app/DayAxis'
import { NextClassHero } from '@/components/app/NextClassHero'
import { TodayTimeline } from '@/components/app/TodayTimeline'
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToday } from '@/services/queries'

function firstName(name: string) {
  return name.split(' ')[0]
}

/**
 * Today.
 *
 * A split view, because the screen answers two different questions that deserve
 * separate columns rather than a single scroll: the left is *me and my day* —
 * who I am, how today stands, where I have to be next — and the right is *what
 * wants something from me*.
 *
 * Giving attention a whole column rather than a strip is the argument the
 * product is making: a timetable shows you your day, but only something that
 * notices things can tell you which of them needs you. Below the fold the day
 * runs full width, where a timeline actually has room to be one.
 */
export default function Dashboard() {
  const { student } = useStore()
  const now = new Date()
  const { view, isPending } = useToday(now)

  /* Four is what the two-column grid holds without the cards going narrow
     enough to wrap their own labels. */
  const stats = buildStats(view).slice(0, 4)

  return (
    <PageContainer width="wide" className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-8">
        {/* ---------------------------------------------------- me and my day */}
        <div className="min-w-0 space-y-6">
          <Greeting name={firstName(student.name)} at={now} view={view} />

          {isPending ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[104px] rounded-tile" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <StatCard key={stat.id} stat={stat} />
              ))}
            </div>
          )}

          <NextClassHero now={view.now} next={view.next} />
        </div>

        {/* ------------------------------------------------- what wants me */}
        <div className="min-w-0">
          <SectionTitle>Needs attention</SectionTitle>
          {isPending ? (
            <Skeleton className="h-[420px] w-full rounded-card" />
          ) : (
            <AttentionStack signals={view.signals} limit={5} />
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------ the day */}
      <section>
        <SectionTitle action={{ label: 'Full week', to: '/app/timetable' }}>Your day</SectionTitle>
        {isPending ? (
          <Skeleton className="h-[300px] w-full rounded-card" />
        ) : view.agenda.length === 0 ? (
          <div className="rounded-card border border-dashed border-line px-5 py-10 text-center">
            <p className="text-[14px] font-medium text-ink">Nothing scheduled today</p>
            <p className="mt-1 text-[13px] text-ink-muted">Your week is on the timetable.</p>
          </div>
        ) : (
          <div className="rounded-card border border-line bg-surface">
            <div className="border-b border-line px-5 pb-3 pt-4 sm:px-6">
              <DayAxis items={view.agenda} at={now} />
            </div>
            <div className="py-2 pr-2">
              <TodayTimeline items={view.agenda} />
            </div>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- AI + pulse */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-8">
        <section className="min-w-0">
          <SectionTitle action={{ label: 'Open', to: '/app/assistant' }}>CampusOS AI</SectionTitle>
          <AssistantLaunch />
        </section>

        <section className="min-w-0">
          <SectionTitle action={{ label: 'Events', to: '/app/events' }}>Campus pulse</SectionTitle>
          {isPending ? (
            <Skeleton className="h-[180px] w-full rounded-card" />
          ) : (
            <CampusPulse items={view.pulse.slice(0, 4)} />
          )}
        </section>
      </div>
    </PageContainer>
  )
}
