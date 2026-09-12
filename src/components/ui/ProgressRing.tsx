import { TrendingDown, TrendingUp } from 'lucide-react'
import { useId } from 'react'

import { cn } from '@/lib/utils'

/**
 * Circular progress used for attendance.
 *
 * The requirement is drawn as a tick on the track, so "72% against a 75% line"
 * is legible at a glance instead of needing two numbers to be compared. The
 * value is always also present as text — colour alone never carries meaning.
 */
export function ProgressRing({
  value,
  threshold,
  size = 132,
  strokeWidth = 10,
  tone = 'brand',
  label,
  caption,
  trend,
  className,
}: {
  /** 0–100 */
  value: number
  /** Optional requirement marker, 0–100 */
  threshold?: number
  size?: number
  strokeWidth?: number
  tone?: 'brand' | 'ok' | 'warn' | 'danger'
  label?: string
  caption?: string
  /**
   * Change over the period, in percentage points. Rendered as a direction
   * chip under the figure — where a number is going is often the more
   * actionable half of where it is.
   */
  trend?: number
  className?: string
}) {
  const gradientId = useId()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const dash = (clamped / 100) * circumference

  /* A gradient along the arc rather than a flat stroke: the lead end reads
     brighter, which gives the ring a direction and stops a large flat band of
     colour looking like a sticker. */
  const toneVar = {
    brand: 'var(--brand)',
    ok: 'var(--ok)',
    warn: 'var(--warn)',
    danger: 'var(--danger)',
  }[tone]

  /* Threshold tick, positioned on the circle. -90deg puts 0% at twelve o'clock. */
  const thresholdAngle =
    threshold === undefined ? null : (Math.max(0, Math.min(100, threshold)) / 100) * 360 - 90
  const thresholdPoint =
    thresholdAngle === null
      ? null
      : {
          x1: size / 2 + (radius - strokeWidth / 2 - 1) * Math.cos((thresholdAngle * Math.PI) / 180),
          y1: size / 2 + (radius - strokeWidth / 2 - 1) * Math.sin((thresholdAngle * Math.PI) / 180),
          x2: size / 2 + (radius + strokeWidth / 2 + 1) * Math.cos((thresholdAngle * Math.PI) / 180),
          y2: size / 2 + (radius + strokeWidth / 2 + 1) * Math.sin((thresholdAngle * Math.PI) / 180),
        }

  return (
    <div className={cn('relative inline-grid place-items-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`${label ?? 'Progress'}: ${Math.round(clamped)}%${
          threshold !== undefined ? `, requirement ${threshold}%` : ''
        }`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={toneVar} stopOpacity={0.55} />
            <stop offset="100%" stopColor={toneVar} stopOpacity={1} />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-surface-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          stroke={`url(#${gradientId})`}
          className="transition-[stroke-dasharray] duration-[1200ms] ease-[cubic-bezier(0.2,0.9,0.1,1)]"
        />
        {thresholdPoint ? (
          <line
            {...thresholdPoint}
            strokeWidth={2}
            strokeLinecap="round"
            className="stroke-ink-subtle"
          />
        ) : null}
      </svg>

      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-[27px] font-semibold leading-none tracking-tight text-ink tabular-nums">
            {Math.round(clamped)}
            <span className="text-[17px] text-ink-muted">%</span>
          </p>
          {trend !== undefined && Math.abs(trend) >= 0.5 ? (
            <p
              className={cn(
                'mt-1 inline-flex items-center gap-1 text-[11.5px] font-medium tabular-nums',
                trend > 0 ? 'text-ok-ink' : 'text-danger-ink',
              )}
            >
              {trend > 0 ? (
                <TrendingUp className="size-3" aria-hidden />
              ) : (
                <TrendingDown className="size-3" aria-hidden />
              )}
              {trend > 0 ? '+' : ''}
              {trend.toFixed(1)} pts
            </p>
          ) : null}
          {caption ? <p className="mt-1.5 text-[11px] text-ink-subtle">{caption}</p> : null}
        </div>
      </div>
    </div>
  )
}
