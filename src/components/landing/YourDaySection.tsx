import { Clock3, FileText, GraduationCap, PartyPopper } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Container, Reveal, SectionHeading } from './primitives'

/** The demo day used on the landing page — the same records the app renders. */
const DAY = [
  { time: '09:00', title: 'Programming in C', detail: 'Block 34 · Room 204', kind: 'class' },
  { time: '10:00', title: 'Free period', detail: '1 hour free', kind: 'gap' },
  { time: '11:00', title: 'Database Management Systems', detail: 'Block 34 · Room 204', kind: 'class' },
  { time: '13:30', title: 'Assignment deadline', detail: 'ER diagram worksheet · DBMS', kind: 'deadline' },
  { time: '17:00', title: 'Tech Club workshop', detail: 'Block 34 · Auditorium', kind: 'event' },
] as const

const icons = {
  class: GraduationCap,
  gap: Clock3,
  deadline: FileText,
  event: PartyPopper,
}

/**
 * What "one system" actually buys the student: a single day.
 *
 * The left column is the raw material — five records from four services. The
 * right is what CampusOS says about it. Putting them side by side is the point:
 * the value is not the list, it is the sentence derived from the list.
 */
export function YourDaySection() {
  return (
    <section id="your-day" className="relative scroll-mt-24 py-24 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Your day"
            title="One timeline, not four tabs."
            description="Classes, coursework and campus events land on the same spine, in the order you will meet them."
          />
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
          {/* the merged day */}
          <Reveal>
            <ol className="rounded-2xl border border-line bg-surface p-2 sm:p-3">
              {DAY.map((entry, index) => {
                const Icon = icons[entry.kind]
                const isNext = index === 2
                const gap = entry.kind === 'gap'

                return (
                  <li key={entry.time} className="flex gap-3 sm:gap-4">
                    <div className="w-[52px] shrink-0 pt-3.5 text-right">
                      <p
                        className={cn(
                          'text-[12.5px] font-medium tabular-nums',
                          index === 0 ? 'text-ink-subtle' : 'text-ink',
                        )}
                      >
                        {entry.time}
                      </p>
                    </div>

                    <div className="relative flex w-4 shrink-0 justify-center">
                      {index < DAY.length - 1 ? (
                        <span
                          aria-hidden
                          className="absolute top-5 h-[calc(100%-0.75rem)] w-px bg-line"
                        />
                      ) : null}
                      <span
                        aria-hidden
                        className={cn(
                          'relative z-10 mt-[15px] size-2.5 rounded-full ring-4 ring-surface',
                          isNext
                            ? 'bg-brand'
                            : gap
                              ? 'bg-transparent ring-0 outline outline-1 outline-line-strong'
                              : 'bg-ink-subtle/45',
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        'mb-1 min-w-0 flex-1 rounded-tile px-3 py-3',
                        isNext && 'bg-brand-soft',
                        gap && 'opacity-60',
                        index === 0 && 'opacity-45',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <Icon
                            className={cn(
                              'size-3.5 shrink-0',
                              isNext ? 'text-brand-ink' : 'text-ink-subtle',
                            )}
                            aria-hidden
                          />
                          <p
                            className={cn(
                              'truncate text-[14px]',
                              gap ? 'text-ink-muted' : 'font-medium text-ink',
                            )}
                          >
                            {entry.title}
                          </p>
                        </div>
                        {isNext ? (
                          <span className="shrink-0 whitespace-nowrap rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-medium text-brand-ink">
                            in 42 min
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate pl-[22px] text-[12.5px] text-ink-subtle">
                        {entry.detail}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </Reveal>

          {/* what the system says about it */}
          <Reveal delay={0.1} className="lg:pt-6">
            <ul className="space-y-3">
              {[
                {
                  tone: 'brand',
                  title: 'Your DBMS class starts in 42 minutes.',
                  detail: 'Block 34 · Room 204',
                },
                {
                  tone: 'danger',
                  title: 'DBMS attendance is 72%.',
                  detail: 'Below the 75% demo threshold — attending the next 3 brings it back.',
                },
                {
                  tone: 'warn',
                  title: 'An assignment is due at 1:30 PM.',
                  detail: 'ER diagram & normalisation worksheet',
                },
                {
                  tone: 'info',
                  title: 'Your hostel complaint was updated.',
                  detail: 'CMP-1042 · technician assigned',
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className={cn(
                    'rounded-card border px-4 py-3.5',
                    item.tone === 'danger'
                      ? 'border-danger/25 bg-danger-soft/25'
                      : item.tone === 'warn'
                        ? 'border-warn/25 bg-warn-soft/25'
                        : item.tone === 'brand'
                          ? 'border-brand-border/40 bg-brand-soft'
                          : 'border-line bg-surface',
                  )}
                >
                  <p className="text-[13.5px] font-medium leading-snug text-ink">{item.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-[12.5px] text-ink-subtle">
              Demo records. CampusOS derives every line above from them — none are written by hand.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
