import { motion, useReducedMotion } from 'framer-motion'
import type { ComponentProps, ReactNode } from 'react'

import { easeOutSoft } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * One reveal pattern for the whole landing page: a short rise + fade the first
 * time a block enters the viewport. When the visitor prefers reduced motion the
 * content simply appears — no transform, no delay.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
}) {
  const reduced = useReducedMotion()
  const Component = motion[as]

  if (reduced) return <Component className={className}>{children}</Component>

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: easeOutSoft, delay }}
    >
      {children}
    </Component>
  )
}

/** Small uppercase kicker that sits above a headline. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-subtle',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Section-level heading block. Centred by default, left-aligned on request. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink sm:text-[34px] lg:text-[40px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Ambient light. Purely decorative, so it is hidden from assistive tech and
 * never intercepts pointer events.
 */
export function Glow({
  className,
  color = 'brand',
  ...props
}: ComponentProps<'div'> & { color?: 'brand' | 'info' }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute rounded-full blur-[100px]',
        color === 'brand' ? 'bg-brand/20' : 'bg-info/15',
        className,
      )}
      {...props}
    />
  )
}

/** Horizontal hairline that fades out at both ends. */
export function FadeRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'h-px w-full bg-gradient-to-r from-transparent via-line-strong to-transparent',
        className,
      )}
    />
  )
}

/** Consistent page gutter + max width for every landing section. */
export function Container({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('mx-auto w-full max-w-[1200px] px-5 sm:px-8', className)} {...props}>
      {children}
    </div>
  )
}
