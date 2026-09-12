import { forwardRef, type ComponentProps, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-[8px] border border-[rgba(99,102,241,0.15)] bg-white/[0.03] px-3 text-[15px] text-white placeholder:text-[#64748b] transition-all duration-200 hover:border-[rgba(99,102,241,0.3)] hover:bg-white/[0.05] focus:border-2 focus:border-[#6366f1] focus:bg-white/[0.08] focus:shadow-[0_2px_8px_rgba(0,0,0,0.12)] focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

export interface InputProps extends ComponentProps<'input'> {
  error?: boolean
  success?: boolean
  sizeVariant?: 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, success, sizeVariant = 'md', ...props },
  ref,
) {
  return (
    <div className="relative w-full">
      <input
        ref={ref}
        className={cn(
          field,
          sizeVariant === 'lg' ? 'h-[48px]' : 'h-[44px]',
          error && 'border-2 border-[#ef4444] bg-[#ef4444]/[0.05] focus:border-[#ef4444]',
          success && 'border-2 border-[#10b981] pr-10 focus:border-[#10b981]',
          className,
        )}
        {...props}
      />
      {success && (
        <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#10b981]" />
      )}
    </div>
  )
})

export interface TextareaProps extends ComponentProps<'textarea'> {
  error?: boolean
  maxCount?: number
  currentCount?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, error, maxCount, currentCount, ...props }, ref) {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          className={cn(
            field,
            'min-h-[120px] resize-y py-2.5 leading-relaxed',
            error && 'border-2 border-[#ef4444] bg-[#ef4444]/[0.05]',
            className,
          )}
          {...props}
        />
        {maxCount !== undefined && (
          <div className="text-right text-[12px] text-[#64748b] mt-1">
            {currentCount ?? 0} / {maxCount}
          </div>
        )}
      </div>
    )
  },
)

export const Select = forwardRef<HTMLSelectElement, ComponentProps<'select'>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(field, 'h-[44px] appearance-none pr-10 bg-[#252d3d]', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#6366f1]" />
    </div>
  )
})

export function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  className,
}: {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none text-[14px] text-[#a0aec0]',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className={cn(
          'size-5 rounded-[4px] border-2 border-[rgba(99,102,241,0.4)] flex items-center justify-center transition-all duration-150',
          checked ? 'bg-[#6366f1] border-[#6366f1]' : 'bg-transparent hover:border-[rgba(99,102,241,0.8)]',
        )}
      >
        {checked && (
          <svg className="size-3 text-white stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  )
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  size = 'md',
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'w-[36px] h-[20px]',
    md: 'w-[44px] h-[24px]',
    lg: 'w-[52px] h-[28px]',
  }
  const thumbSizes = {
    sm: 'size-[16px] translate-x-[2px] data-[state=checked]:translate-x-[18px]',
    md: 'size-[20px] translate-x-[2px] data-[state=checked]:translate-x-[22px]',
    lg: 'size-[24px] translate-x-[2px] data-[state=checked]:translate-x-[26px]',
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-ring',
        sizeClasses[size],
        checked ? 'bg-[#6366f1]' : 'bg-[#4b5563]',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        data-state={checked ? 'checked' : 'unchecked'}
        className={cn(
          'pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out my-auto',
          thumbSizes[size],
        )}
      />
    </button>
  )
}

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  htmlFor?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-[12px] font-semibold text-[#a0aec0]">
        {label}
        {required && <span className="text-[#ef4444] ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-[12px] text-[#ef4444]" role="alert">
          <AlertCircle className="size-3 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-[#64748b]">{hint}</p>
      ) : null}
    </div>
  )
}
