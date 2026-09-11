import {
  Bell,
  Bot,
  CalendarDays,
  CalendarRange,
  Clock3,
  LayoutDashboard,
  MapPin,
  MessageSquareWarning,
  ScanLine,
  Search,
  Sparkles,
} from 'lucide-react'

import { previewData } from '@/data/landing'
import { cn } from '@/lib/utils'

/* The preview mirrors the shipped navigation, in the same order. */
const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'AI Assistant', icon: Bot },
  { label: 'Attendance', icon: ScanLine },
  { label: 'Timetable', icon: CalendarDays },
  { label: 'Complaints', icon: MessageSquareWarning },
  { label: 'Events', icon: CalendarRange },
]

/**
 * A scaled-down but genuine rendering of the CampusOS dashboard.
 *
 * Everything is real markup at small type sizes rather than an image, so it
 * stays crisp at any density and reflows on narrow screens. The figures match
 * the demo records the real dashboard reads from.
 */
export function DashboardPreview() {
  const { student, greeting, date, nextClass, attendance, complaint, assistant } = previewData

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e4 edge-highlight">
      {/* ----------------------------------------------------- window chrome */}
      <div className="flex h-9 items-center gap-3 border-b border-line bg-surface-muted px-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-[9px] rounded-full bg-ink-subtle/25" />
          <span className="size-[9px] rounded-full bg-ink-subtle/25" />
          <span className="size-[9px] rounded-full bg-ink-subtle/25" />
        </div>
        <div className="mx-auto hidden rounded-md bg-canvas/60 px-3 py-1 text-[10px] font-medium text-ink-subtle sm:block">
          campusos.app/dashboard
        </div>
      </div>

      <div className="flex">
        {/* ---------------------------------------------------------- sidebar */}
        <aside className="hidden w-[186px] shrink-0 flex-col gap-1 border-r border-line bg-surface-muted/50 p-3 lg:flex">
          <div className="mb-3 flex items-center gap-2 px-2 py-1">
            <span className="grid size-6 place-items-center rounded-md bg-brand text-[11px] font-bold text-on-brand">
              C
            </span>
            <span className="text-[13px] font-semibold tracking-tight text-ink">CampusOS</span>
          </div>

          {sidebarItems.map(({ label, icon: Icon, active }) => (
            <div
              key={label}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12px] font-medium',
                active ? 'bg-brand-soft text-ink' : 'text-ink-muted',
              )}
            >
              <Icon className={cn('size-[15px]', active ? 'text-brand-ink' : 'text-ink-subtle')} />
              {label}
            </div>
          ))}

          <div className="mt-auto flex items-center gap-2.5 rounded-lg border border-line bg-surface p-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-[10px] font-semibold text-brand-ink">
              {student.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-medium text-ink">{student.name}</p>
              <p className="truncate text-[10px] text-ink-subtle">{student.meta}</p>
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------------- main */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
            <div className="flex h-7 flex-1 items-center gap-2 rounded-lg border border-line bg-canvas/50 px-2.5 text-[11px] text-ink-subtle">
              <Search className="size-3.5" />
              Search classes, requests or events
            </div>
            <Bell className="size-[15px] shrink-0 text-ink-subtle" />
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-[10px] font-semibold text-brand-ink lg:hidden">
              {student.initials}
            </span>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            {/* greeting */}
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-subtle">
                {date}
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-ink sm:text-[19px]">
                {greeting}
              </h3>
            </div>

            {/* next class — the dominant element, as in the real dashboard */}
            <div className="relative overflow-hidden rounded-xl border border-line bg-surface-raised p-3.5">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-brand/15 blur-[44px]"
              />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand-ink">
                  <Clock3 className="size-3" />
                  {nextClass.starts}
                </span>
                <p className="mt-2 text-[14.5px] font-semibold leading-snug tracking-tight text-ink">
                  {nextClass.course}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-ink-subtle">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3" />
                    {nextClass.time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {nextClass.location}
                  </span>
                  <span>{nextClass.faculty}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* attendance */}
              <div className="rounded-xl border border-line bg-surface-raised p-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[11.5px] font-semibold text-ink">Attendance</p>
                  <span className="text-[10px] text-ink-subtle">
                    {attendance.required}% required
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-[26px] font-semibold leading-none tracking-tight text-ink">
                    {attendance.overall}%
                  </p>
                  <span className="text-[10.5px] font-medium text-danger-ink">
                    {attendance.status}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {attendance.courses.map((row) => (
                    <li key={row.subject}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] text-ink-muted">{row.subject}</span>
                        <span className="shrink-0 text-[10px] font-semibold tabular-nums text-ink">
                          {row.value}%
                        </span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-canvas">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            row.value < attendance.required ? 'bg-danger' : 'bg-warn',
                          )}
                          style={{ width: `${row.value}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                {/* open request */}
                <div className="rounded-xl border border-line bg-surface-raised p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11.5px] font-semibold text-ink">Open request</p>
                    <span className="rounded-full bg-warn-soft px-1.5 py-0.5 text-[9.5px] font-medium text-warn-ink">
                      {complaint.status}
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] font-medium text-ink">{complaint.title}</p>
                  <p className="mt-0.5 text-[10px] text-ink-subtle">
                    {complaint.reference} · {complaint.location}
                  </p>
                  <div className="mt-2.5 flex gap-1" aria-hidden>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          'h-[3px] flex-1 rounded-full',
                          i <= 3 ? 'bg-brand' : 'bg-canvas',
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* assistant */}
                <div className="rounded-xl border border-brand-border/60 bg-brand-soft p-3.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-brand-ink" />
                    <p className="text-[11.5px] font-semibold text-ink">AI Assistant</p>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-ink">“{assistant.question}”</p>
                  <p className="mt-1.5 text-[10px] leading-[1.55] text-ink-muted">
                    {assistant.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
