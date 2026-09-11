import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { AssistantLaunch } from '@/components/app/AssistantLaunch'
import { AttentionStack } from '@/components/app/AttentionStack'
import { CampusPulse } from '@/components/app/CampusPulse'
import { CommandDeck } from '@/components/app/CommandDeck'
import { DayAxis } from '@/components/app/DayAxis'
import { InsightRow } from '@/components/app/InsightRow'
import { TodayTimeline } from '@/components/app/TodayTimeline'
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { stageShortLabel } from '@/data'
import { cn, formatRelative } from '@/lib/utils'
import { useToday } from '@/services/queries'

function firstName(name: string) {
  return name.split(' ')[0]
}

function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode
  action?: { label: string; to: string }
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="text-[17px] font-semibold tracking-tight text-ink">{children}</h2>
      {action ? (
        <Link
          to={action.to}
          className="shrink-0 text-[13px] font-medium text-brand-ink transition-colors hover:text-ink"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}

/**
 * Today.
 *
 * Ordered by urgency, not by department. The screen reads top to bottom as:
 * where you have to be → what needs you → the shape of your day → what CampusOS
 * can do → what is coming → your own figures.
 *
 * Only the first two blocks are visually dominant. Everything below is quieter
 * on purpose: a dashboard where eight sections shout equally is a menu.
 */
export default function Dashboard() {
  const { student } = useStore()
  const now = new Date()

  /* One call, one snapshot, one clock. Every figure on this screen is derived
     by `composeToday` in the service layer — the page below only renders it. */
  const { view, queries, isPending } = useToday(now)
  const { timetable, complaints } = queries

  return (
    <PageContainer width="wide" className="space-y-10">
      {/* ============================================================ deck
          Greeting, live state, the core, and now/next — one composed region,
          no containers. */}
      <CommandDeck view={view} name={firstName(student.name)} at={now} isPending={isPending} />

      {/* ============================================================ the day
          A full-bleed rail rather than a card: the axis gives the shape of the
          day, the list gives the detail, and they read as one object. */}
      <section>
        <SectionTitle action={{ label: 'Full week', to: '/app/timetable' }}>Your day</SectionTitle>

        {timetable.isPending ? (
          <Skeleton className="h-[280px] w-full rounded-card" />
        ) : timetable.isError ? (
          <ErrorState onRetry={() => timetable.refetch()} />
        ) : view.agenda.length === 0 ? (
          <div className="rounded-card border border-dashed border-line px-5 py-10 text-center">
            <p className="text-[14px] font-medium text-ink">Nothing scheduled today</p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Your week is on the timetable.
            </p>
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

      {/* ==================================================== attention + AI
          The two halves of the product's claim: what it noticed, and what you
          can ask it. Side by side because they answer each other. */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
        <section className="min-w-0">
          <SectionTitle>Needs your attention</SectionTitle>
          {isPending ? (
            <Skeleton className="h-[230px] w-full rounded-card" />
          ) : (
            <AttentionStack signals={view.signals} />
          )}
        </section>

        <section className="min-w-0">
          <SectionTitle action={{ label: 'Open', to: '/app/assistant' }}>CampusOS AI</SectionTitle>
          <AssistantLaunch />
        </section>
      </div>

      {/* ========================================================== insights */}
      <section>
        <SectionTitle>Your insights</SectionTitle>
        {isPending ? (
          <Skeleton className="h-[96px] w-full rounded-card" />
        ) : (
          <InsightRow insights={view.insights} />
        )}
      </section>

      {/* ============================================ pulse + recent activity */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
        <section className="min-w-0">
          <SectionTitle action={{ label: 'Events', to: '/app/events' }}>Campus pulse</SectionTitle>
          {isPending ? (
            <Skeleton className="h-[180px] w-full rounded-card" />
          ) : (
            <CampusPulse items={view.pulse.slice(0, 5)} />
          )}
        </section>

        <section className="min-w-0">
          <SectionTitle action={{ label: 'All requests', to: '/app/complaints' }}>
            Recent activity
          </SectionTitle>
          {complaints.isPending ? (
            <div className="rounded-card border border-line bg-surface p-5">
              <SkeletonRows count={2} />
            </div>
          ) : view.openRequests.length === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-surface/50 px-5 py-8 text-center">
              <p className="text-[14px] font-medium text-ink">Nothing outstanding</p>
              <p className="mt-1 text-[13px] text-ink-muted">
                Anything you report shows up here with its status.
              </p>
              <Link
                to="/app/complaints/new"
                className="mt-4 inline-flex text-[13px] font-medium text-brand-ink hover:text-ink"
              >
                Report an issue
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
              {view.openRequests.slice(0, 3).map((complaint) => {
                const last = complaint.timeline[complaint.timeline.length - 1]
                return (
                  <li key={complaint.id}>
                    <Link
                      to={`/app/complaints/${complaint.id}`}
                      className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-raised"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'mt-1.5 size-1.5 shrink-0 rounded-full',
                          complaint.stage === 'verification' ? 'bg-warn' : 'bg-brand',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-ink">
                          {complaint.title}
                        </p>
                        <p className="mt-0.5 truncate text-[12.5px] text-ink-subtle">
                          {complaint.reference} · {stageShortLabel[complaint.stage]} ·{' '}
                          {formatRelative(last.timestamp)}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="mt-0.5 size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </PageContainer>
  )
}
