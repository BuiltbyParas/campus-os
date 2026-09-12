import { cva, type VariantProps } from 'class-variance-authority'
import { Check, Loader2 } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useRipple } from '@/hooks/useRipple'
import { cn } from '@/lib/utils'

/**
 * The button system.
 *
 * Seven intents, and only one of them is filled with the accent gradient: if
 * every button is purple, none of them is the primary action. `secondary` is
 * an outline for the supporting choice, `tertiary` is text-only for the action
 * that must be available without competing, and the status variants are
 * reserved for outcomes rather than for emphasis.
 *
 * Three things make a press feel physical rather than instantaneous: the
 * surface brightens and glows on hover, the whole control scales *down* past
 * rest on press with a spring curve, and a ripple travels from the exact point
 * touched. The last one matters most on a phone, where there is no hover state
 * to confirm that the finger landed on the target.
 */
const button = cva(
  [
    'ripple-host relative inline-flex select-none items-center justify-center gap-2 rounded-control',
    'font-semibold tracking-[0.25px] whitespace-nowrap',
    'transition-[background-color,background-image,color,border-color,box-shadow,transform,filter]',
    'duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    'active:scale-[0.95] disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'grad-accent text-on-brand elev-1',
          'hover:brightness-110 hover:scale-[1.03] hover:shadow-[var(--shadow-sm),var(--glow-s)]',
        ].join(' '),
        secondary: [
          'border-2 border-brand-border bg-transparent text-brand-ink',
          'hover:border-brand hover:bg-brand/10 hover:shadow-[var(--glow-xs)]',
        ].join(' '),
        tertiary: [
          'border border-line-strong bg-transparent text-ink-muted',
          'hover:border-brand-border hover:bg-brand/[0.08] hover:text-ink',
        ].join(' '),
        soft: 'bg-brand-soft text-brand-ink hover:bg-brand/20 hover:shadow-[var(--glow-xs)]',
        ghost: 'text-ink-muted hover:bg-brand/[0.08] hover:text-ink',
        danger: [
          'bg-[linear-gradient(135deg,#ef4444,#f97316)] text-white elev-1',
          'hover:brightness-110 hover:scale-[1.03] hover:shadow-[var(--shadow-sm),0_0_20px_rgb(239_68_68_/_0.4)]',
        ].join(' '),
        success: [
          'grad-success text-ink-inverse elev-1',
          'hover:brightness-110 hover:scale-[1.03] hover:shadow-[var(--shadow-sm),0_0_20px_rgb(16_185_129_/_0.4)]',
        ].join(' '),
      },
      size: {
        sm: 'h-9 px-3 text-[13px]',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-6 text-[15px]',
        /* Compact rounded control for filters and toggles. */
        pill: 'h-9 rounded-full px-4 text-[12px]',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-12 w-12',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
)

type BaseProps = VariantProps<typeof button> & {
  loading?: boolean
  /** Replaces the label with a checkmark for a moment after a successful action. */
  succeeded?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  /** Count bubble pinned to the top-right corner. */
  badge?: number
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    BaseProps {}

function Badgelet({ count }: { count: number }) {
  return (
    <span
      aria-hidden
      className="absolute -right-1.5 -top-1.5 grid min-w-[20px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-[20px] text-white ring-2 ring-canvas"
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    block,
    loading,
    succeeded,
    icon,
    iconRight,
    badge,
    children,
    disabled,
    onPointerDown,
    ...props
  },
  ref,
) {
  const { ref: rippleRef, rippleProps } = useRipple<HTMLButtonElement>()

  return (
    <button
      ref={(node) => {
        rippleRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cn(button({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onPointerDown={(event) => {
        rippleProps.onPointerDown(event)
        onPointerDown?.(event)
      }}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : succeeded ? (
        <Check className="size-4 animate-[count-pop_400ms_var(--ease-premium)]" aria-hidden />
      ) : (
        icon
      )}
      {loading ? <span className="opacity-80">Working…</span> : children}
      {!loading && !succeeded && iconRight}
      {typeof badge === 'number' && badge > 0 ? <Badgelet count={badge} /> : null}
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

/**
 * A circular control carrying only an icon.
 *
 * It takes a required `label` rather than an optional one: an icon button with
 * no accessible name is invisible to a screen reader, and making the prop
 * required means that cannot be forgotten.
 */
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'children' | 'size'> & {
    label: string
    size?: 'sm' | 'md' | 'lg'
    icon: ReactNode
  }
>(function IconButton({ label, icon, size = 'md', className, badge, ...props }, ref) {
  const sizes = { sm: 'size-9', md: 'size-11', lg: 'size-12' }
  return (
    <Button
      ref={ref}
      aria-label={label}
      title={label}
      variant="ghost"
      className={cn(
        'ripple-host relative rounded-full bg-brand-soft p-0 text-ink-muted',
        'hover:bg-brand/15 hover:text-ink hover:shadow-[var(--glow-xs)]',
        '[&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:scale-115',
        sizes[size],
        className,
      )}
      badge={badge}
      {...props}
    >
      {icon}
    </Button>
  )
})

/**
 * Buttons that belong to one decision, rendered as a single connected control.
 *
 * Segmenting them visually is what separates "pick one of these" from "here
 * are three unrelated actions that happen to sit together".
 */
export function ButtonGroup({
  children,
  className,
  connected = true,
}: {
  children: ReactNode
  className?: string
  connected?: boolean
}) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex items-center',
        connected
          ? '[&>*]:rounded-none [&>*:first-child]:rounded-tile-control [&>*:last-child]:rounded-r-control [&>*+*]:-ml-px'
          : 'gap-2',
        className,
      )}
    >
      {children}
    </div>
  )
}
