import { ArrowUpRight, GraduationCap, Mail, MapPin, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useStore } from '@/app/store'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { DemoTag } from '@/components/ui/DemoTag'
import { courses } from '@/data'
import { useAttendance, useComplaints } from '@/services/queries'

export default function Profile() {
  const { student, registeredEventIds } = useStore()
  const attendance = useAttendance()
  const complaints = useComplaints({ status: 'all' })

  const open = (complaints.data ?? []).filter((item) => item.stage !== 'resolved').length

  const facts = [
    { icon: GraduationCap, label: 'Programme', value: `${student.program} · Semester ${student.semester}` },
    { icon: Mail, label: 'Campus email', value: student.email },
    { icon: MapPin, label: 'Residence', value: `${student.hostel} · ${student.room}` },
  ]

  const stats = [
    {
      label: 'Overall attendance',
      value: attendance.data ? `${Math.round(attendance.data.overallPercentage)}%` : '—',
      to: '/app/attendance',
    },
    { label: 'Open requests', value: String(open), to: '/app/complaints' },
    { label: 'Events registered', value: String(registeredEventIds.length), to: '/app/events' },
  ]

  return (
    <PageContainer width="narrow" className="space-y-6">
      <PageHeader
        title="Profile"
        action={
          <Link
            to="/app/settings"
            className="press inline-flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-medium text-ink hover:border-line-strong"
          >
            <Settings className="size-4" aria-hidden />
            Settings
          </Link>
        }
      />

      {/* ------------------------------------------------------------ identity */}
      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-soft text-[19px] font-semibold text-brand-ink">
            {student.initials}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[20px] font-semibold tracking-tight text-ink">
              {student.name}
            </h2>
            <p className="mt-0.5 text-[13.5px] text-ink-muted">
              {student.rollNumber} · Section {student.section}
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-3.5 border-t border-line pt-5">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-start gap-3">
              <fact.icon className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden />
              <div className="min-w-0">
                <dt className="text-[12px] text-ink-subtle">{fact.label}</dt>
                <dd className="mt-0.5 truncate text-[14px] text-ink">{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* --------------------------------------------------------------- stats */}
      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="press group rounded-card border border-line bg-surface p-4 hover:border-line-strong"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12.5px] text-ink-subtle">{stat.label}</p>
              <ArrowUpRight
                className="size-3.5 text-ink-subtle transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </div>
            <p className="mt-2 text-[24px] font-semibold leading-none tabular-nums text-ink">
              {stat.value}
            </p>
          </Link>
        ))}
      </section>

      {/* ------------------------------------------------------------- courses */}
      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-[17px] font-semibold tracking-tight text-ink">
            Semester {student.semester} courses
          </h2>
          <DemoTag />
        </div>

        <ul className="divide-y divide-line">
          {courses.map((course) => (
            <li key={course.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-ink">{course.name}</p>
                <p className="mt-0.5 truncate text-[12.5px] text-ink-subtle">
                  {course.code} · {course.faculty}
                </p>
              </div>
              <span className="shrink-0 text-[12.5px] text-ink-subtle">
                {course.credits} credits
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[12.5px] text-ink-subtle">
        Demo profile — this is a fictional student record created for the prototype.
      </p>
    </PageContainer>
  )
}
