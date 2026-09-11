import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

const button = cva(
  'relative inline-flex select-none items-center justify-center gap-2 rounded-control font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 active:scale-[0.975] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-on-brand shadow-e1 hover:bg-brand-hover hover:shadow-e2',
        secondary:
          'bg-surface text-ink border border-line shadow-e1 hover:border-line-strong hover:bg-surface-muted',
        soft: 'bg-brand-soft text-brand-ink hover:brightness-[0.97] dark:hover:brightness-110',
        ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
        danger: 'bg-danger text-white shadow-e1 hover:brightness-95',
      },
      size: {
        sm: 'h-9 px-3 text-[13px]',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-[15px]',
        icon: 'h-10 w-10',
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
