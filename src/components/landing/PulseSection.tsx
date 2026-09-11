import { CalendarDays, FileText, Megaphone, Wrench } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Container, Reveal, SectionHeading } from './primitives'

const PULSE = [
  {
    icon: CalendarDays,
    when: '5:00 PM',
    title: 'Tech Club workshop',
    detail: 'Block 34 · Auditorium',
    action: 'Register',
    tone: 'brand' as const,
  },
  {
    icon: FileText,
    when: 'Tomorrow',
    title: 'Pointers lab record due',
    detail: 'Programming in C · 5:00 PM',
    action: 'View',
    tone: 'warn' as const,
  },
  {
    icon: Wrench,
    when: 'Today',
    title: 'Library maintenance',
    detail: 'Floor 2 closed until 4:00 PM',
    action: null,
    tone: 'neutral' as const,
  },
  {
    icon: Megaphone,
    when: 'Updated',
    title: 'CMP-1042 · technician assigned',
    detail: 'Hostel 23 · Room 204',
    action: 'Track',
    tone: 'info' as const,
  },
]

/**
 * Campus Pulse.
 *
 * Everything a student would otherwise learn from a noticeboard, a group chat
 * or not at all — in time order, with an action where one exists. Deliberately
 * not a feed: there is nothing to scroll endlessly and nothing to react to.
 */
export function PulseSection() {
  return (
    <section
      id="pulse"
      className="relative scroll-mt-24 border-y border-line bg-surface-muted/40 py-24 sm:py-28 lg:py-32"
    >
      <Container>
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Campus pulse"
            title="The things you would otherwise miss."
            description="Deadlines, events, service interruptions and updates on your own requests — in one place, in the order they matter."
          />
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {PULSE.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06} className="h-full">
              <div className="flex h-full items-start gap-3.5 bg-canvas p-5">
                <span
                  className={cn(
                    'mt-0.5 grid size-9 shrink-0 place-items-center rounded-full',
                    item.tone === 'brand'
                      ? 'bg-brand-soft text-brand-ink'
                      : item.tone === 'warn'
                        ? 'bg-warn-soft text-warn-ink'
                        : item.tone === 'info'
                          ? 'bg-info-soft text-info-ink'
                          : 'bg-surface-muted text-ink-subtle',
                  )}
                >
                  <item.icon className="size-[17px]" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink-subtle">
                    {item.when}
                  </p>
                  <p className="mt-1 text-[15px] font-medium leading-snug text-ink">{item.title}</p>
                  <p className="mt-1 text-[12.5px] text-ink-muted">{item.detail}</p>
                </div>

                {item.action ? (
                  <span className="shrink-0 rounded-control border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink">
                    {item.action}
                  </span>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
