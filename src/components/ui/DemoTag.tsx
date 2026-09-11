import { cn } from '@/lib/utils'

/**
 * Marks a figure as demo data.
 *
 * CampusOS has no backend yet, and several numbers on screen — the minimum
 * attendance requirement above all — would read as institutional policy if
 * shown plainly. This tag is how the product stays honest about that, so it is
 * deliberately legible rather than a faint whisper.
 */
export function DemoTag({ className, title }: { className?: string; title?: string }) {
  return (
    <span
      title={title ?? 'Demo data — not an official university record'}
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
        'bg-surface-muted text-ink-subtle',
        className,
      )}
    >
      Demo
    </span>
  )
}

/** Sentence-length version for the foot of a screen. */
export function DemoNote({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-[12.5px] leading-relaxed text-ink-subtle', className)}>
      {children ?? 'All figures on this screen are demo data, not official university records.'}
    </p>
  )
}
