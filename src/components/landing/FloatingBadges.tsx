import { Clock3, Sparkles, TrendingDown } from 'lucide-react'

import { floatingSignals } from '@/data/landing'
import { cn } from '@/lib/utils'

/**
 * Three small product signals that hover around the dashboard preview.
 *
 * Each is anchored to the outside of the preview (`right-full` / `left-full`)
 * and pulled back just far enough to straddle its edge, so a chip never lands
 * on top of the interface it is annotating. Below `xl` there is no gutter left
 * to hang them in, so they are removed rather than shrunk.
 *
 * They use the thin glass weight: they float above the page, which is exactly
 * what the material is for.
 */

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('glass-thin absolute z-20 rounded-xl p-3', className)}>{children}</div>
  )
}

export function FloatingBadges() {
  const { attendance, assistant, nextClass } = floatingSignals

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
      {/* attendance ------------------------------------------------------- */}
      <Chip className="right-full top-[26%] -mr-5 w-[172px] animate-float">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-ink-muted">{attendance.label}</span>
          <TrendingDown className="size-3.5 text-danger" />
        </div>
        <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-tight text-ink">
          {attendance.value}
        </p>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-canvas">
          <div className="h-full w-[72%] rounded-full bg-danger" />
        </div>
        <p className="mt-2 text-[10px] text-danger-ink">{attendance.note}</p>
      </Chip>

      {/* next class ------------------------------------------------------- */}
      <Chip className="left-full top-[16%] -ml-5 w-[182px] animate-float-slow">
        <div className="flex items-center gap-1.5">
          <Clock3 className="size-3.5 text-brand-ink" />
          <span className="text-[11px] font-medium text-ink-muted">{nextClass.label}</span>
        </div>
        <p className="mt-2 text-[13px] font-semibold tracking-tight text-ink">{nextClass.value}</p>
        <p className="mt-0.5 text-[11px] text-ink-subtle">{nextClass.note}</p>
      </Chip>

      {/* assistant -------------------------------------------------------- */}
      <Chip className="bottom-[18%] left-full -ml-6 w-[188px] animate-float">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-brand-ink" />
          <span className="text-[11px] font-semibold text-ink">{assistant.label}</span>
        </div>
        <p className="mt-2 text-[12.5px] font-medium text-ink">{assistant.value}</p>
        <p className="mt-0.5 text-[10.5px] text-ink-subtle">{assistant.note}</p>
      </Chip>
    </div>
  )
}
