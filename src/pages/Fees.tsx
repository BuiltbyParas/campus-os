import { useQuery } from '@tanstack/react-query'
import { Download, Wallet, CreditCard, Receipt, Clock, CheckCircle2 } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { DemoNote, DemoTag } from '@/components/ui/DemoTag'
import { Skeleton, SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/data/fees'
import { cn, formatDateLabel } from '@/lib/utils'
import { getFees } from '@/services/fees'

export default function Fees() {
  const { toast } = useToast()
  
  const query = useQuery({
    queryKey: ['fees'],
    queryFn: getFees,
  })

  const data = query.data

  const handleDownload = () => {
    toast('Demo mode: Receipt download not available')
  }

  const handlePay = () => {
    toast('Payment portal not connected in demo')
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Fees & Payments"
        description="Semester 2 · 2026-27"
      />

      {query.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-[196px] w-full rounded-card" />
          <Skeleton className="h-[300px] w-full rounded-card" />
          <Skeleton className="h-[200px] w-full rounded-card" />
        </div>
      ) : query.isError || !data ? (
        <ErrorState
          title="Fees are unavailable"
          description="We could not load your fee records just now."
          onRetry={() => query.refetch()}
        />
      ) : (
        <>
          {/* ------------------------------------------------------- overview */}
          <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-[14px] font-medium text-ink-muted uppercase tracking-wider">
                    Balance Due
                  </h2>
                  {data.source === 'demo' && <DemoTag />}
                </div>
                
                <div className="flex items-baseline gap-3 mb-2">
                  <span className={cn(
                    "text-4xl font-semibold tracking-tight tabular-nums",
                    data.pendingAmount === 0 ? "text-ok" : "text-warn-ink"
                  )}>
                    {formatCurrency(data.pendingAmount)}
                  </span>
                  {data.pendingAmount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-warn-soft/30 px-2.5 py-1 text-[12px] font-medium text-warn-ink">
                      <Clock className="size-3" />
                      Due in 5 days
                    </span>
                  )}
                </div>
                
                <p className="text-[13px] text-ink-muted">
                  of {formatCurrency(data.totalFee)} total · {formatCurrency(data.totalPaid)} paid
                </p>
                
                {/* Progress bar */}
                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-line">
                  <div 
                    className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, (data.totalPaid / data.totalFee) * 100))}%` }}
                  />
                </div>
              </div>
              
              {data.pendingAmount > 0 && (
                <div className="shrink-0 rounded-card border border-brand-border/30 bg-brand-soft/20 p-4 md:w-[280px]">
                  <h3 className="text-[15px] font-semibold text-ink mb-1">Next Payment</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-[20px] font-semibold tabular-nums text-ink">{formatCurrency(data.pendingAmount)}</span>
                    <span className="text-[12px] text-ink-muted">due {formatDateLabel(data.dueDate)}</span>
                  </div>
                  <button 
                    onClick={handlePay}
                    className="press w-full inline-flex items-center justify-center gap-2 rounded-control bg-brand px-4 py-2 text-[14px] font-medium text-on-brand shadow-sm hover:opacity-90"
                  >
                    <CreditCard className="size-4" />
                    Pay now
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ------------------------------------------------------ fee breakdown */}
            <section className="rounded-card border border-line bg-surface overflow-hidden flex flex-col">
              <div className="p-5 border-b border-line bg-surface-muted">
                <h2 className="text-[17px] font-semibold tracking-tight text-ink flex items-center gap-2">
                  <Wallet className="size-[18px] text-brand-ink" />
                  Fee Breakdown
                </h2>
              </div>
              <div className="p-5 flex-1">
                <div className="space-y-3">
                  {data.lineItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-[14px] text-ink-muted">{item.label}</span>
                      <span className={cn(
                        "text-[14px] font-medium tabular-nums",
                        item.isCredit ? "text-ok" : "text-ink"
                      )}>
                        {item.isCredit ? '-' : ''}{formatCurrency(Math.abs(item.amount))}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-line flex justify-between items-center">
                  <span className="text-[15px] font-semibold text-ink">Total</span>
                  <span className="text-[15px] font-semibold tabular-nums text-ink">
                    {formatCurrency(data.totalFee)}
                  </span>
                </div>
              </div>
            </section>

            {/* ----------------------------------------------------- payment history */}
            <section className="rounded-card border border-line bg-surface overflow-hidden flex flex-col">
              <div className="p-5 border-b border-line bg-surface-muted">
                <h2 className="text-[17px] font-semibold tracking-tight text-ink flex items-center gap-2">
                  <Receipt className="size-[18px] text-brand-ink" />
                  Payment History
                </h2>
              </div>
              <div className="p-0">
                {data.payments.length === 0 ? (
                  <div className="p-8 text-center text-[14px] text-ink-muted">
                    No payments recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-line">
                    {data.payments.map((payment) => (
                      <div key={payment.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[15px] font-semibold tabular-nums text-ink">
                              {formatCurrency(payment.amount)}
                            </span>
                            {payment.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2 py-0.5 text-[11px] font-medium text-ok uppercase tracking-wider">
                                <CheckCircle2 className="size-3" />
                                Paid
                              </span>
                            )}
                          </div>
                          <div className="text-[13px] text-ink-muted flex items-center gap-1.5">
                            <span>{formatDateLabel(payment.date)}</span>
                            <span>·</span>
                            <span>{payment.receiptId}</span>
                            <span>·</span>
                            <span className="capitalize">{payment.method}</span>
                          </div>
                        </div>
                        <button
                          onClick={handleDownload}
                          className="press inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-muted"
                        >
                          <Download className="size-3.5" />
                          Receipt
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <DemoNote>
            Fee figures and payments are demo data for this prototype. They do not reflect real financial obligations.
          </DemoNote>
        </>
      )}
    </PageContainer>
  )
}
