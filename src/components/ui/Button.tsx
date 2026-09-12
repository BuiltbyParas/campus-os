import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const button = cva(
  'relative inline-flex select-none items-center justify-center gap-2 rounded-[8px] font-semibold transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[#6366f1] text-[#ffffff] hover:brightness-110 hover:shadow-[0_8px_24px_rgba(0,0,0,0.20),_0_4px_8px_rgba(0,0,0,0.12)]',
        secondary: 'bg-transparent border-2 border-[#6366f1] text-[#6366f1] hover:bg-[rgba(99,102,241,0.1)] hover:border-[#8b5cf6]',
        tertiary: 'bg-transparent border-none text-[#6366f1] hover:bg-[rgba(99,102,241,0.08)] hover:underline',
        danger: 'bg-[#ef4444] text-[#ffffff] hover:brightness-110 hover:shadow-[0_8px_24px_rgba(0,0,0,0.20),_0_4px_8px_rgba(0,0,0,0.12)]',
        success: 'bg-[#10b981] text-[#ffffff] hover:brightness-110',
      },
      size: {
        sm: 'h-[36px] px-3 text-[14px]',
        md: 'h-[44px] px-[12px] text-[14px]',
        lg: 'h-[48px] px-[16px] text-[16px]',
        icon: 'h-[44px] w-[44px]',
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
        <Loader2 className="size-[16px] animate-spin text-[#6366f1]" aria-hidden />
      ) : (
        icon && <span className="mr-1">{icon}</span>
      )}
      {!loading && children}
      {!loading && iconRight && <span className="ml-1">{iconRight}</span>}
    </button>
  )
})

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
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {iconRight && <span className="ml-1">{iconRight}</span>}
    </Link>
  )
}
