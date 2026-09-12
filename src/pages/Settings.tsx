import { LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { useTheme } from '@/app/theme'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { cn } from '@/lib/utils'
import type { AppPreferences, NotificationPreferences } from '@/types'

/* ------------------------------------------------------------------ pieces */

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-card border border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-[16px] font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="mt-1 text-[13px] text-ink-muted">{description}</p> : null}
      </div>
      <div className="px-5">{children}</div>
    </section>
  )
}

/** Accessible switch built on a real checkbox, so it works with the keyboard. */
function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description?: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-4 last:border-b-0">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-[14px] font-medium text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-muted">
            {description}
          </span>
        ) : null}
      </label>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-200',
          /* The visible track stays 24px; the touch target is expanded to 44px
             with a transparent pseudo-element so the thumb has something to hit. */
          'after:absolute after:-inset-x-1 after:-inset-y-2.5 after:content-[""]',
          checked ? 'border-brand bg-brand' : 'border-line bg-surface-muted',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-ink shadow-e1 transition-[left] duration-200',
            checked ? 'left-[24px] bg-on-brand' : 'left-[3px] bg-ink-subtle',
          )}
        />
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------- page */

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

const notificationRows: {
  key: keyof NotificationPreferences
  label: string
  description: string
}[] = [
  {
    key: 'attendanceAlerts',
    label: 'Attendance alerts',
    description: 'Tell me when a course drops close to the requirement.',
  },
  {
    key: 'timetableChanges',
    label: 'Timetable changes',
    description: 'Cancelled classes, room moves and rescheduled sessions.',
  },
  {
    key: 'complaintUpdates',
    label: 'Request updates',
    description: 'Each time one of my reported issues changes stage.',
  },
  {
    key: 'eventReminders',
    label: 'Event reminders',
    description: 'A nudge before events I have registered for.',
  },
]

const preferenceRows: { key: keyof AppPreferences; label: string; description: string }[] = [
  {
    key: 'weekStartsMonday',
    label: 'Week starts on Monday',
    description: 'Affects how the timetable week is ordered.',
  },
  {
    key: 'compactTimetable',
    label: 'Compact timetable',
    description: 'Show more classes at once by reducing row height.',
  },
  {
    key: 'showDemoLabels',
    label: 'Show demo labels',
    description: 'Mark every figure that comes from demo data rather than a real record.',
  },
]

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const {
    student,
    notifications,
    preferences,
    setNotificationPreference,
    setPreference,
  } = useStore()

  return (
    <PageContainer width="narrow" className="space-y-5">
      <PageHeader title="Settings" />

      {/* ------------------------------------------------------------ account */}
      <Section title="Account">
        <div className="flex items-center justify-between gap-4 border-b border-line py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand-ink">
              {student.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-ink">{student.name}</p>
              <p className="truncate text-[12.5px] text-ink-subtle">{student.email}</p>
            </div>
          </div>
          <Link
            to="/app/profile"
            className="tap shrink-0 text-[13px] font-medium text-brand-ink hover:text-ink"
          >
            View profile
          </Link>
        </div>

        <div className="py-4">
          <Link
            to="/"
            className="press inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface-raised px-3.5 text-[13.5px] font-medium text-ink-muted hover:border-line-strong hover:text-ink"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Link>
        </div>
      </Section>

      {/* --------------------------------------------------------- appearance */}
      <Section title="Appearance" description="CampusOS is designed dark-first.">
        <div className="py-4">
          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => {
              const active = theme === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'press flex flex-col items-center gap-2 rounded-tile border px-3 py-3.5',
                    active
                      ? 'border-brand-border/50 bg-brand-soft text-ink'
                      : 'border-line bg-surface-raised text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  <option.icon
                    className={cn('size-[18px]', active && 'text-brand-ink')}
                    aria-hidden
                  />
                  <span className="text-[13px] font-medium">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------ notifications */}
      <Section title="Notifications" description="Choose what is worth interrupting you for.">
        {notificationRows.map((row) => (
          <Toggle
            key={row.key}
            id={`notify-${row.key}`}
            label={row.label}
            description={row.description}
            checked={notifications[row.key]}
            onChange={(next) => setNotificationPreference(row.key, next)}
          />
        ))}
      </Section>

      {/* -------------------------------------------------------- preferences */}
      <Section title="Preferences">
        {preferenceRows.map((row) => (
          <Toggle
            key={row.key}
            id={`pref-${row.key}`}
            label={row.label}
            description={row.description}
            checked={preferences[row.key]}
            onChange={(next) => setPreference(row.key, next)}
          />
        ))}
      </Section>

      <p className="text-[12.5px] text-ink-subtle">
        Demo environment — settings are saved in this browser only and are not synced to an account.
      </p>
    </PageContainer>
  )
}
