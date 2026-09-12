import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'


const badge = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors duration-150',
  {
    variants: {
      tone: {
        neutral: 'bg-white/5 text-[#a0aec0] border border-white/5',
        brand: 'bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/20',
        ok: 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20',
        warn: 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/20',
        danger: 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20',
        info: 'bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/20',
        outline: 'border border-[rgba(99,102,241,0.2)] text-[#a0aec0]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'sm' },
  },
)

export interface BadgeProps extends ComponentProps<'span'>, VariantProps<typeof badge> {
  icon?: ReactNode
  pulse?: boolean
}

export function Badge({ className, tone, size, icon, pulse, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badge({ tone, size }), className)} {...props}>
      {pulse && (
        <span className="size-1.5 rounded-full bg-current animate-pulse" />
      )}
      {icon}
      {children}
    </span>
  )
}

