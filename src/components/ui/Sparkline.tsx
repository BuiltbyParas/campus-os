import { useId } from 'react'

import { cn } from '@/lib/utils'

/**
 * A trend, at the size of a word.
 *
 * Small enough to sit inside a stat tile or a table row, which is the point:
 * "72%" tells a student where they are, and the shape beside it tells them
 * which way they are going. That second fact is usually the one they act on.
 *
 * Deliberately unlabelled — no axes, no gridlines, no tooltip. A sparkline is
 * read as a gesture, not measured; the exact figures always sit next to it as
 * text. The whole series is exposed to assistive technology through
 * `aria-label` instead, so the shape is never the only way to get the data.
 */
export function Sparkline({
  values,
  width = 72,
  height = 24,
  tone = 'brand',
  /** Draws a faint line at this value — a target or threshold. */
  threshold,
  label,
  className,
}: {
  values: number[]
  width?: number
  height?: number
  tone?: 'brand' | 'ok' | 'warn' | 'danger' | 'muted'
  threshold?: number
  /** Describes the series for screen readers. */
  label?: string
  className?: string
}) {
  const gradientId = useId()

  if (values.length < 2) return null

  const stroke = {
    brand: 'var(--brand)',
    ok: 'var(--ok)',
    warn: 'var(--warn)',
    danger: 'var(--danger)',
    muted: 'var(--ink-subtle)',
  }[tone]

  /* The scale includes the threshold so the reference line cannot fall outside
     the drawing area, and is padded so a flat series still renders as a line
     through the middle rather than clinging to an edge. */
  const pool = threshold === undefined ? values : [...values, threshold]
  const rawMin = Math.min(...pool)
  const rawMax = Math.max(...pool)
  const pad = rawMax === rawMin ? 1 : (rawMax - rawMin) * 0.15
  const min = rawMin - pad
  const max = rawMax + pad

  const inset = 2
  const x = (index: number) =>
    inset + (index / (values.length - 1)) * (width - inset * 2)
  const y = (value: number) =>
    height - inset - ((value - min) / (max - min)) * (height - inset * 2)

  const line = values.map((value, index) => `${x(index)},${y(value)}`).join(' ')
  const area = `${inset},${height} ${line} ${width - inset},${height}`

  const last = values[values.length - 1]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      role="img"
      aria-label={label ?? `Trend: ${values.map((value) => Math.round(value)).join(', ')}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>

      {threshold !== undefined ? (
        <line
          x1={0}
          x2={width}
          y1={y(threshold)}
          y2={y(threshold)}
          stroke="var(--line-strong)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      ) : null}

      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* The head of the series — where you are now. */}
      <circle cx={x(values.length - 1)} cy={y(last)} r={2} fill={stroke} />
    </svg>
  )
}
