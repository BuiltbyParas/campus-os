import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

import { revealContainer, revealItem } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * Staggered page-load reveal.
 *
 * `Stack` is the container and every direct `Stack.Item` is a step in the
 * sequence. Under `prefers-reduced-motion` both collapse to plain elements —
 * not a faster animation, none at all, which is what the preference asks for.
 */
export function Stack({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={revealContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section'
}) {
  const reduced = useReducedMotion()
  const Component = motion[as]

  if (reduced) {
    return as === 'section' ? (
      <section className={className}>{children}</section>
    ) : (
      <div className={className}>{children}</div>
    )
  }

  return (
    <Component className={cn(className)} variants={revealItem}>
      {children}
    </Component>
  )
}
