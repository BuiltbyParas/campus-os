import { useStore } from '@/app/store'
import { AlertGrid } from '@/components/app/AlertCard'
import { AssistantLaunch } from '@/components/app/AssistantLaunch'
import { CampusPulse } from '@/components/app/CampusPulse'
import { Greeting, StatCard, buildStats } from '@/components/app/DashboardStats'
import { DayAxis } from '@/components/app/DayAxis'
import { NextClassHero } from '@/components/app/NextClassHero'
import { TodayTimeline } from '@/components/app/TodayTimeline'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionHeading } from '@/components/ui/Card'
import { RevealItem, Stack } from '@/components/ui/Reveal'
import { DemoNote } from '@/components/ui/DemoTag'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToday } from '@/services/queries'

function firstName(name: string) {
  return name.split(' ')[0]
}

/**
 * Today.
 *
 * The screen reads top to bottom as a single argument rather than as a grid of
 * widgets: who I am and how today stands, then the four figures that decide
 * whether the day is going well, then where I have to be next, then what wants
 * something from me, then the day itself.
 *
 * Giving attention a full-width row of cards rather than a strip is the claim
 * the product is making: a timetable shows you your day, but only something
 * that notices things can tell you which parts of it need you.
 */
export default function Dashboard() {
  const { student } = useStore()
  const now = new Date()
  const { view, isPending } = useToday(now)

  /* Four figures. A fifth turns a row a student reads into a row they scan. */
  const stats = buildStats(view).slice(0, 4)
  const attention = view.signals.slice(0, 3)

  return (
    <PageContainer width="wide">
      <Stack className="space-y-8">
      <RevealItem>
        <Greeting name={firstName(student.name)} at={now} view={view} />
      </RevealItem>

      <RevealItem>
      {isPending ? (
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[160px] rounded-tile" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      )}
      </RevealItem>

      <RevealItem className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-stretch">
        <NextClassHero
          now={view.now}
          next={view.next}
          sessionsToday={view.todaySessions.length}
          className="h-full"
        />

        <section className="flex min-w-0 flex-col">
          <SectionHeading
            title="CampusOS AI"
            subtitle="Answers drawn from your own records"
            action={{ label: 'Open assistant', to: '/app/assistant' }}
          />
          <AssistantLaunch className="flex-1" />
        </section>
      </RevealItem>

      <RevealItem as="section">
        <SectionHeading
          title="Needs attention"
          subtitle={
            attention.length === 1
              ? '1 item is asking for you'
              : `${attention.length} items are asking for you`
          }
          action={{ label: 'View all', to: '/app/notifications' }}
        />
        {isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[200px] rounded-tile" />
            ))}
          </div>
        ) : (
          <AlertGrid signals={view.signals} limit={3} />
        )}
      </RevealItem>

      <RevealItem as="section">
        <SectionHeading
          title="Your day"
          subtitle={
            view.todaySessions.length === 1
              ? '1 class scheduled'
              : `${view.todaySessions.length} classes scheduled`
          }
          action={{ label: 'Full week', to: '/app/timetable' }}
        />
        {isPending ? (
          <Skeleton className="h-[300px] w-full rounded-tile" />
        ) : view.agenda.length === 0 ? (
          <div className="card-premium border-dashed px-5 py-12 text-center">
            <p className="text-[15px] font-semibold text-ink">Nothing scheduled today</p>
            <p className="mt-1.5 text-[13.5px] text-ink-muted">Your week is on the timetable.</p>
          </div>
        ) : (
          <div className="card-premium overflow-hidden">
            <div className="border-b border-line px-5 pb-4 pt-5 sm:px-7">
              <DayAxis items={view.agenda} at={now} />
            </div>
            <div className="py-2 pr-2">
              <TodayTimeline items={view.agenda} />
            </div>
          </div>
        )}
      </RevealItem>

      <RevealItem as="section">
        <SectionHeading
          title="Campus pulse"
          subtitle="What is happening around you today"
          action={{ label: 'All events', to: '/app/events' }}
        />
        {isPending ? (
          <Skeleton className="h-[180px] w-full rounded-tile" />
        ) : (
          <CampusPulse items={view.pulse.slice(0, 4)} />
        )}
      </RevealItem>

      <DemoNote />
      </Stack>
    </PageContainer>
  )
}
