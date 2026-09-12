import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

/**
 * The button system.
 *
 * Five intents, and only one of them is filled with the accent: if every
 * button is purple, none of them is the primary action. `secondary` is an
 * outline for the supporting choice, `tertiary` is text-only for the action
 * that must be available without competing, and the two status variants are
 * reserved for outcomes rather than emphasis.
 *
 * Hover lifts and scales very slightly; the press scales *down* past rest, so
 * a click always registers physically even when the result is instant.
 */
const button = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 rounded-control font-semibold',
    'transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-on-brand shadow-e1 hover:bg-brand-hover hover:scale-[1.02] hover:shadow-e2',
        secondary:
          'border-2 border-brand-border bg-transparent text-brand-ink hover:border-brand hover:bg-brand/10',
        tertiary:
          'text-brand-ink underline-offset-4 hover:bg-brand/[0.08] hover:underline',
        soft: 'bg-brand-soft text-brand-ink hover:brightness-125',
        ghost: 'text-ink-muted hover:bg-brand/[0.08] hover:text-ink',
        danger:
          'bg-danger text-white shadow-e1 hover:brightness-110 hover:scale-[1.02] hover:shadow-e2',
        success:
          'bg-ok text-ink-inverse shadow-e1 hover:brightness-110 hover:scale-[1.02] hover:shadow-e2',
      },
      size: {
        sm: 'h-9 px-3 text-[13px]',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-5 text-[15px]',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
)

type BaseProps = VariantProps<typeof button> & {
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    BaseProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, loading, icon, iconRight, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(button({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        icon
      )}
      {children}
      {!loading && iconRight}
    </button>
  )
})

/** Same visual language as Button, but renders a router link. */
export function ButtonLink({
  to,
  className,
  variant,
  size,
  block,
  icon,
  iconRight,
  children,
  ...props
}: BaseProps & {
  to: string
  className?: string
  children?: ReactNode
} & Omit<React.ComponentProps<typeof Link>, 'to' | 'className'>) {
  return (
    <Link to={to} className={cn(button({ variant, size, block }), className)} {...props}>
      {icon}
      {children}
      {iconRight}
    </Link>
  )
}
