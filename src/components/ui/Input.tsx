import { AlertCircle, Check, X } from 'lucide-react'
import { forwardRef, useId, useState, type ComponentProps, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * The field surface.
 *
 * Glass rather than a solid fill, so an input reads as a recess in the page
 * rather than a card sitting on it. The border carries every state: a trace of
 * the accent at rest, brighter on hover, a solid 2px accent plus a glow on
 * focus, and the status colour when a field has been judged.
 */
const field = [
  'w-full rounded-control border-[1.5px] border-line bg-field text-ink',
  'text-[15px] tracking-[0.25px] placeholder:text-ink-faint',
  'transition-[border-color,background-color,box-shadow,color] duration-200',
  'hover:border-line-strong hover:bg-field-hover',
  'focus:border-brand focus:bg-field-hover focus:shadow-[var(--shadow-sm),var(--glow-xs)]',
  'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

const statusRing = {
  error: 'border-danger bg-danger-soft/40 focus:border-danger focus:shadow-[0_0_12px_rgb(239_68_68_/_0.3)]',
  success: 'border-ok focus:border-ok focus:shadow-[0_0_12px_rgb(16_185_129_/_0.3)]',
  none: '',
}

export type FieldStatus = 'error' | 'success' | 'none'

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  status?: FieldStatus
  /** Sits inside the field on the leading edge. */
  icon?: ReactNode
  /** Shows a clear button while the field has a value. */
  onClear?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, status = 'none', icon, onClear, value, ...props },
  ref,
) {
  const hasValue = value !== undefined && value !== ''

  return (
    <div className="relative">
      {icon ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint transition-colors [:focus-within>&]:text-brand-ink"
        >
          {icon}
        </span>
      ) : null}

      <input
        ref={ref}
        value={value}
        aria-invalid={status === 'error' || undefined}
        className={cn(
          field,
          'h-12 px-4',
          icon && 'pl-11',
          (onClear && hasValue) || status === 'success' ? 'pr-11' : null,
          statusRing[status],
          className,
        )}
        {...props}
      />

      {status === 'success' ? (
        <Check
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ok-ink"
        />
      ) : onClear && hasValue ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear field"
          className="absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-faint transition-colors hover:bg-brand-soft hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  )
})

export interface TextareaProps extends ComponentProps<'textarea'> {
  status?: FieldStatus
  /** Renders a live "n / max" counter under the field. */
  maxChars?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, status = 'none', maxChars, value, ...props },
  ref,
) {
  const used = typeof value === 'string' ? value.length : 0

  return (
    <div>
      <textarea
        ref={ref}
        value={value}
        maxLength={maxChars}
        aria-invalid={status === 'error' || undefined}
        className={cn(field, 'min-h-30 resize-y px-4 py-3 leading-relaxed', statusRing[status], className)}
        {...props}
      />
      {maxChars ? (
        <p
          className={cn(
            'mt-1 text-right text-[12px] tabular-nums',
            used > maxChars * 0.9 ? 'text-warn-ink' : 'text-ink-faint',
          )}
        >
          {used} / {maxChars}
        </p>
      ) : null}
    </div>
  )
})

export const Select = forwardRef<HTMLSelectElement, ComponentProps<'select'> & { status?: FieldStatus }>(
  function Select({ className, children, status = 'none', ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(field, 'h-12 appearance-none px-4 pr-10', statusRing[status], className)}
          {...props}
        >
          {children}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint"
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    )
  },
)

/**
 * Label, control, and whatever the form has to say about it.
 *
 * The help text and the error message occupy the same slot: an error replaces
 * the hint rather than appearing beneath it, so the control never shifts the
 * layout of the form when validation fails.
 */
export function Field({
  label,
  hint,
  error,
  success,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string
  hint?: string
  error?: string
  success?: string
  required?: boolean
  htmlFor: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[12px] font-semibold tracking-[0.5px] text-ink-muted"
      >
        {label}
        {required ? (
          <span className="ml-1 text-danger-ink" aria-hidden>
            *
          </span>
        ) : null}
      </label>

      {children}

      {error ? (
        <p
          role="alert"
          className="flex animate-[slide-in-left_150ms_var(--ease-elegant)] items-center gap-1.5 text-[12px] text-danger-ink"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : success ? (
        <p className="flex items-center gap-1.5 text-[12px] text-ok-ink">
          <Check className="size-3.5 shrink-0" aria-hidden />
          {success}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

/**
 * Search field with a results panel.
 *
 * Kept here rather than in the header because the same control serves the
 * sidebar, the command palette trigger and the dedicated mobile search page.
 */
export function SearchField({
  value,
  onChange,
  placeholder = 'Search anything…',
  children,
  className,
  onFocus,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** The results panel, rendered under the field when present. */
  children?: ReactNode
  className?: string
  onFocus?: () => void
}) {
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <Input
        id={id}
        type="search"
        role="searchbox"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => {
          setOpen(true)
          onFocus?.()
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onClear={() => onChange('')}
        icon={
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
            <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.8" />
            <path d="m13.5 13.5 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        }
      />
      {open && children ? (
        <div className="glass-modal absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl p-1.5 elev-3">
          {children}
        </div>
      ) : null}
    </div>
  )
}
