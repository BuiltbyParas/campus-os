import { cn } from '@/lib/utils'

const fillTone = {
  brand: 'bg-brand',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
} as const

/**
 * A horizontal bar with an optional requirement line.
 *
 * The linear counterpart to `ProgressRing`, for the places a ring would be too
 * heavy — a row in a list, a line in a breakdown. The threshold marker is the
 * part that matters: a bar at 72% means nothing until you can see the 75% line
 * it is sitting just under.
 *
 * The fill animates from zero on mount via a CSS transition, so a value that
 * arrives after loading resolves visibly rather than appearing fully drawn.
 * Under `prefers-reduced-motion` the global stylesheet reduces that to nothing.
 */
export function Meter({
  value,
  threshold,
  tone = 'brand',
  size = 'md',
  label,
  className,
}: {
  /** 0–100 */
  value: number
  /** Optional requirement marker, 0–100 */
  threshold?: number
  tone?: keyof typeof fillTone
  size?: 'sm' | 'md'
  /** Describes what is being measured, for assistive technology. */
  label?: string
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-surface-muted',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className,
      )}
      role="meter"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-out',
          fillTone[tone],
        )}
        style={{ width: `${clamped}%` }}
      />

      {threshold !== undefined ? (
        <span
          aria-hidden
          className="absolute inset-y-0 w-px bg-ink-subtle/70"
          style={{ left: `${Math.max(0, Math.min(100, threshold))}%` }}
        />
      ) : null}
    </div>
  )
}
