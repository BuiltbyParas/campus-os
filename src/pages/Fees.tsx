import { Check, CheckCircle2, Clock3, Sparkles, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { CountUp } from '@/components/ui/CountUp'
import { DemoNote, DemoTag } from '@/components/ui/DemoTag'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { dueLabel, feeStatusLabel, formatMoney, instalmentTone } from '@/lib/fees'
import { cn, daysUntil, formatDateLabel } from '@/lib/utils'
import { useFees } from '@/services/queries'
import type { FeeInstalment, FeeSummary } from '@/types'

const toneClass: Record<'ok' | 'warn' | 'danger' | 'info', string> = {
  ok: 'bg-ok-soft text-ok-ink',
  warn: 'bg-warn-soft text-warn-ink',
  danger: 'bg-danger-soft text-danger-ink',
  info: 'bg-surface-muted text-ink-muted',
}

/**
 * Fees.
 *
 * A fee page that opens on a table of line items makes the student do the work.
 * This one opens on the only two things that are actually actionable — what is
 * owed and when — and puts the breakdown and the ledger underneath for anyone
 * who wants to check the arithmetic.
 */
export default function Fees() {
  const fees = useFees()
  const summary = fees.data

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Fees"
        description="What you owe, when it is due, and what you have already paid."
      />

      {fees.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-[260px] w-full rounded-card" />
          <Skeleton className="h-[230px] w-full rounded-card" />
          <Skeleton className="h-[200px] w-full rounded-card" />
        </div>
      ) : fees.isError || !summary ? (
        <ErrorState
          title="Fee details are unavailable"
          description="We could not load your fee record just now."
          onRetry={() => fees.refetch()}
        />
      ) : (
        <>
          {/* ------------------------------------------------------- the ask */}
          {/* One number, given the whole width. A fee screen that opens on a
              table makes the student compute the only figure they came for. */}
          <section className="relative overflow-hidden card-premium">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-28 size-[380px] rounded-full bg-brand/14 blur-[100px]"
            />

            <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Wallet className="size-[18px] text-brand-ink" aria-hidden />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                    {summary.nextDue ? 'Upcoming payment' : 'Outstanding balance'}
                  </p>
                  {summary.source === 'demo' ? <DemoTag /> : null}
                </div>

                <p className="mt-3 text-[44px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink sm:text-[52px]">
                  <CountUp
                    value={summary.nextDue?.amount ?? summary.outstanding}
                    format={(value) => formatMoney(value, summary.currency)}
                  />
                </p>

                {summary.nextDue ? (
                  <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px]">
                    <span
                      className={cn(
                        'font-medium',
                        daysUntil(summary.nextDue.dueDate) < 0
                          ? 'text-danger-ink'
                          : daysUntil(summary.nextDue.dueDate) <= 7
                            ? 'text-warn-ink'
                            : 'text-ink',
                      )}
                    >
                      {dueLabel(summary.nextDue.dueDate)}
                    </span>
                    <span className="text-ink-muted">
                      · {summary.nextDue.label} · {formatDateLabel(summary.nextDue.dueDate)}
                    </span>
                  </p>
                ) : (
                  <p className="mt-3 flex items-center gap-2 text-[14px] text-ok-ink">
                    <CheckCircle2 className="size-4" aria-hidden />
                    Everything for this semester is paid.
                  </p>
                )}

                <Link
                  to={`/app/assistant?q=${encodeURIComponent('When is my next fee payment due?')}`}
                  className="press mt-6 inline-flex h-10 items-center gap-1.5 rounded-control border border-line bg-surface px-3.5 text-[13.5px] font-medium text-ink hover:border-line-strong"
                >
                  <Sparkles className="size-3.5 text-brand-ink" aria-hidden />
                  Ask CampusOS about fees
                </Link>
              </div>

              {/* the allocation: where the semester's money actually stands */}
              <Allocation summary={summary} />
            </div>
          </section>

          {/* ---------------------------------------------- payment timeline */}
          {/* A ledger as a spine rather than a table: instalments are events in
              time, and the gap between "paid in July" and "due next month" is
              the information a row of cells throws away. */}
          <section className="card-premium p-5 sm:p-6">
            <h2 className="text-[17px] font-semibold tracking-tight text-ink">Payment timeline</h2>
            <ol className="mt-5">
              {summary.instalments.map((instalment, index) => (
                <InstalmentStep
                  key={instalment.id}
                  instalment={instalment}
                  currency={summary.currency}
                  last={index === summary.instalments.length - 1}
                />
              ))}
            </ol>
          </section>

          {/* ------------------------------------------------------ breakdown */}
          <section className="card-premium p-5 sm:p-6">
            <h2 className="text-[17px] font-semibold tracking-tight text-ink">
              What the fee covers
            </h2>

            <ul className="mt-4 space-y-3">
              {summary.breakdown.map((line) => {
                const share = (line.amount / Math.max(1, summary.totalPayable)) * 100
                return (
                  <li key={line.label}>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="truncate text-[13.5px] text-ink">
                        {line.label}
                        {line.note ? (
                          <span className="ml-2 text-[12px] text-ink-subtle">{line.note}</span>
                        ) : null}
                      </p>
                      <p className="shrink-0 text-[13.5px] tabular-nums text-ink">
                        {formatMoney(line.amount, summary.currency)}
                      </p>
                    </div>
                    {/* Each line against the whole, so the shape of the fee is
                        readable without dividing anything. */}
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-brand/60 transition-[width] duration-700 ease-out"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>

            {summary.scholarship ? (
              <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-[12.5px] leading-snug text-ink-muted">
                <Check className="mt-px size-3.5 shrink-0 text-ok" aria-hidden />
                <span>
                  {summary.scholarship.name} of{' '}
                  <span className="font-medium text-ok-ink">
                    {formatMoney(summary.scholarship.amount, summary.currency)}
                  </span>{' '}
                  is already applied to the instalments above.
                </span>
              </p>
            ) : null}
          </section>

          <DemoNote>
            Fictional fee amounts, deadlines and scholarship terms, created for this prototype. They
            are not any institution's real fees and must not be relied on.
          </DemoNote>
        </>
      )}
    </PageContainer>
  )
}

/**
 * Where the semester's money stands, as one bar.
 *
 * Paid, due and still-to-come are three slices of the same total, so they
 * belong in one object rather than three statistics a student has to add up.
 * The scholarship sits underneath as a reduction, because that is what it is.
 */
function Allocation({ summary }: { summary: FeeSummary }) {
  const total = Math.max(1, summary.totalPayable)
  const paidShare = (summary.totalPaid / total) * 100
  const dueShare = ((summary.nextDue?.amount ?? 0) / total) * 100
  const laterShare = Math.max(0, 100 - paidShare - dueShare)

  const legend = [
    { label: 'Paid', amount: summary.totalPaid, className: 'bg-ok' },
    ...(summary.nextDue
      ? [{ label: 'Due now', amount: summary.nextDue.amount, className: 'bg-warn' }]
      : []),
    ...(laterShare > 0.5
      ? [
          {
            label: 'Later',
            amount: summary.outstanding - (summary.nextDue?.amount ?? 0),
            className: 'bg-surface-muted',
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col justify-end lg:border-l lg:border-line lg:pl-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
        This semester
      </p>

      <div
        className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-surface-muted"
        role="img"
        aria-label={`${formatMoney(summary.totalPaid, summary.currency)} paid of ${formatMoney(summary.totalPayable, summary.currency)}`}
      >
        <div
          className="h-full bg-ok transition-[width] duration-700 ease-out"
          style={{ width: `${paidShare}%` }}
        />
        <div
          className="h-full bg-warn transition-[width] duration-700 ease-out"
          style={{ width: `${dueShare}%` }}
        />
      </div>

      <dl className="mt-4 space-y-2">
        {legend.map((entry) => (
          <div key={entry.label} className="flex items-center gap-2.5">
            <span
              aria-hidden
              className={cn('size-2 shrink-0 rounded-full', entry.className)}
            />
            <dt className="flex-1 text-[12.5px] text-ink-muted">{entry.label}</dt>
            <dd className="text-[13px] font-medium tabular-nums text-ink">
              {formatMoney(entry.amount, summary.currency)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <p className="text-[12.5px] text-ink-subtle">Total payable</p>
        <p className="text-[14px] font-semibold tabular-nums text-ink">
          {formatMoney(summary.totalPayable, summary.currency)}
        </p>
      </div>

      {summary.scholarship ? (
        <p className="mt-1.5 flex items-center justify-between text-[12.5px]">
          <span className="text-ink-subtle">{summary.scholarship.name}</span>
          <span className="font-medium tabular-nums text-ok-ink">
            −{formatMoney(summary.scholarship.amount, summary.currency)}
          </span>
        </p>
      ) : null}
    </div>
  )
}

/** One instalment as a step on the spine. */
function InstalmentStep({
  instalment,
  currency,
  last,
}: {
  instalment: FeeInstalment
  currency: string
  last: boolean
}) {
  const tone = instalmentTone(instalment)
  const paid = instalment.status === 'paid'

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!last ? (
        <span
          aria-hidden
          className={cn(
            'absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px',
            paid ? 'bg-ok/40' : 'bg-line',
          )}
        />
      ) : null}

      <span
        aria-hidden
        className={cn(
          'relative z-10 mt-0.5 grid size-[27px] shrink-0 place-items-center rounded-full border-2',
          paid && 'border-ok bg-ok text-ink-inverse',
          !paid && tone === 'danger' && 'border-danger bg-canvas',
          !paid && tone === 'warn' && 'border-warn bg-canvas',
          !paid && tone === 'info' && 'border-line bg-canvas',
        )}
      >
        {paid ? (
          <Check className="size-3.5" strokeWidth={3} />
        ) : (
          <Clock3
            className={cn(
              'size-3.5',
              tone === 'danger' ? 'text-danger' : tone === 'warn' ? 'text-warn' : 'text-ink-subtle',
            )}
          />
        )}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-[14px] font-medium text-ink">{instalment.label}</p>
          <p className="text-[14px] font-semibold tabular-nums text-ink">
            {formatMoney(instalment.amount, currency)}
          </p>
        </div>

        <p className="mt-0.5 text-[12.5px] text-ink-subtle">
          {paid && instalment.paidOn
            ? `Paid ${formatDateLabel(instalment.paidOn)}${
                instalment.method ? ` · ${instalment.method}` : ''
              }${instalment.reference ? ` · ${instalment.reference}` : ''}`
            : `${dueLabel(instalment.dueDate)} · ${formatDateLabel(instalment.dueDate)}`}
        </p>

        <span
          className={cn(
            'mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
            toneClass[tone],
          )}
        >
          {feeStatusLabel[instalment.status]}
        </span>
      </div>
    </li>
  )
}
