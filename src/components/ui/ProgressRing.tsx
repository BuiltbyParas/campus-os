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
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const dash = (clamped / 100) * circumference

  const tones = {
    brand: 'stroke-brand',
    ok: 'stroke-ok',
    warn: 'stroke-warn',
    danger: 'stroke-danger',
  }

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
          className={cn(tones[tone], 'transition-[stroke-dasharray] duration-700 ease-out')}
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
          {caption ? <p className="mt-1.5 text-[11px] text-ink-subtle">{caption}</p> : null}
        </div>
      </div>
    </div>
  )
}
