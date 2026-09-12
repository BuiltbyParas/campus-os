import { motion } from 'framer-motion'
import { useId } from 'react'

import { cn } from '@/lib/utils'

export interface TabOption<T extends string> {
  value: T
  label: string
  count?: number
}

/**
 * Segmented control with a shared layout indicator that slides between tabs.
 * Uses real radio semantics so arrow keys work without extra key handling.
 */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  className,
  label,
}: {
  options: TabOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  label: string
}) {
  const layoutId = useId()

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex w-full items-center gap-1 rounded-full border border-line bg-surface-muted p-1 sm:w-auto',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={active}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex-1 rounded-full px-3.5 py-2.5 text-[13px] font-medium transition-colors sm:flex-none sm:py-2',
              active ? 'text-ink' : 'text-ink-muted hover:text-ink',
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-surface shadow-e1"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10 whitespace-nowrap">
              {option.label}
              {typeof option.count === 'number' ? (
                <span className={cn('ml-1.5', active ? 'text-ink-subtle' : 'text-ink-subtle')}>
                  {option.count}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
