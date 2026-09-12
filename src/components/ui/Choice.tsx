import { Check, Minus } from 'lucide-react'
import { useId, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Checkbox, radio and switch.
 *
 * All three are a native input made invisible with a drawn control beside it,
 * rather than a `div` with a click handler. That is what keeps the keyboard,
 * the form, the label association and assistive technology working for free —
 * and on touch the whole row is the target, because a 22px box is not
 * something a thumb should have to find.
 */

function Row({
  htmlFor,
  label,
  description,
  control,
  reverse,
  className,
}: {
  htmlFor: string
  label: ReactNode
  description?: ReactNode
  control: ReactNode
  reverse?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-tile transition-colors duration-200',
        reverse && 'justify-between',
        className,
      )}
    >
      {reverse ? null : control}
      <label htmlFor={htmlFor} className="min-w-0 flex-1 cursor-pointer select-none">
        <span className="block text-[14px] font-medium leading-snug text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-subtle">
            {description}
          </span>
        ) : null}
      </label>
      {reverse ? control : null}
    </div>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  indeterminate,
  disabled,
  className,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: ReactNode
  description?: ReactNode
  indeterminate?: boolean
  disabled?: boolean
  className?: string
}) {
  const id = useId()

  return (
    <Row
      htmlFor={id}
      label={label}
      description={description}
      className={cn(disabled && 'pointer-events-none opacity-50', className)}
      control={
        <span className="relative mt-0.5 inline-grid size-[22px] shrink-0 place-items-center">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
            className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-[6px]"
          />
          <span
            aria-hidden
            className={cn(
              'pointer-events-none grid size-[22px] place-items-center rounded-[6px] border-2 transition-all duration-150',
              checked || indeterminate
                ? 'grad-accent border-transparent shadow-[var(--glow-xs)]'
                : 'border-brand-border bg-transparent group-hover:border-line-active',
            )}
          >
            {indeterminate ? (
              <Minus className="size-3.5 text-white" strokeWidth={3} />
            ) : checked ? (
              <Check className="size-3.5 animate-[count-pop_180ms_var(--ease-premium)] text-white" strokeWidth={3} />
            ) : null}
          </span>
        </span>
      }
    />
  )
}

export function Radio({
  checked,
  onChange,
  label,
  description,
  name,
  disabled,
  className,
}: {
  checked: boolean
  onChange: () => void
  label: ReactNode
  description?: ReactNode
  name: string
  disabled?: boolean
  className?: string
}) {
  const id = useId()

  return (
    <Row
      htmlFor={id}
      label={label}
      description={description}
      className={cn(disabled && 'pointer-events-none opacity-50', className)}
      control={
        <span className="relative mt-0.5 inline-grid size-[22px] shrink-0 place-items-center">
          <input
            id={id}
            type="radio"
            name={name}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-full"
          />
          <span
            aria-hidden
            className={cn(
              'pointer-events-none grid size-[22px] place-items-center rounded-full border-2 transition-all duration-150',
              checked
                ? 'border-brand shadow-[var(--glow-xs)]'
                : 'border-brand-border group-hover:border-line-active',
            )}
          >
            {checked ? (
              <span className="grad-accent size-2 animate-[count-pop_180ms_var(--ease-premium)] rounded-full" />
            ) : null}
          </span>
        </span>
      }
    />
  )
}

/**
 * The switch.
 *
 * A switch is not a checkbox: it takes effect the moment it moves, so it is
 * used only for settings that apply immediately and never inside a form that
 * has to be submitted.
 */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  className?: string
}) {
  const id = useId()

  return (
    <Row
      htmlFor={id}
      label={label}
      description={description}
      reverse
      className={cn(disabled && 'pointer-events-none opacity-50', className)}
      control={
        <span className="relative ml-4 mt-0.5 inline-block h-7 w-[52px] shrink-0">
          <input
            id={id}
            type="checkbox"
            role="switch"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
            /* The input covers the drawn track, and on a touch device it is
               inset outwards so the target clears 44px without the track
               itself having to be that tall. */
            className="peer absolute -inset-y-2 inset-x-0 z-10 size-auto w-full cursor-pointer appearance-none"
          />
          <span
            aria-hidden
            className={cn(
              'absolute inset-0 rounded-full transition-all duration-200',
              checked
                ? 'grad-accent shadow-[var(--glow-xs)]'
                : 'bg-ink-faint/40 group-hover:bg-ink-faint/60',
            )}
          />
          <span
            aria-hidden
            className={cn(
              'absolute top-1/2 size-6 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0_/_0.35)]',
              'transition-[left] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
              checked ? 'left-[24px]' : 'left-[2px]',
            )}
          />
        </span>
      }
    />
  )
}
