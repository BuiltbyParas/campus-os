import type { ComponentProps, ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * The functional glass material.
 *
 * Glass is a *layer*, not a decoration. It belongs to things that float above
 * content and stay put while content moves underneath — navigation, toolbars,
 * floating actions, the assistant composer, modals. Ordinary content surfaces
 * use `Card` instead.
 *
 * Weights:
 *   `nav`   navigation layers over scrolling content — densest veil, so text
 *           above it stays legible no matter what scrolls behind
 *   `panel` toolbars, composers, floating controls
 *   `thin`  small chips where the environment should read through strongly
 *   `modal` dialogs, which carry the reading task and so take the densest veil
 */
export function GlassPanel<T extends ElementType = 'div'>({
  as,
  weight = 'panel',
  className,
  children,
  ...props
}: {
  as?: T
  weight?: 'nav' | 'panel' | 'thin' | 'modal'
  className?: string
  children?: ReactNode
} & Omit<ComponentProps<T>, 'as' | 'className' | 'children'>) {
  const Component = (as ?? 'div') as ElementType
  const weights = {
    nav: 'glass-nav',
    panel: 'glass',
    thin: 'glass-thin',
    modal: 'glass-modal',
  }

  return (
    <Component className={cn(weights[weight], className)} {...props}>
      {children}
    </Component>
  )
}
