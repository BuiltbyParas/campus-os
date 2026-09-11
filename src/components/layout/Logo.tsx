import { cn } from '@/lib/utils'

/**
 * The CampusOS mark: a rounded square holding a simple campus "compass" glyph.
 * Deliberately geometric so it reads at 20px in the sidebar.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('size-8', className)}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="9" className="fill-brand" />
      <path
        d="M22.5 9.5 18.4 18.4 9.5 22.5l4.1-8.9 8.9-4.1Z"
        className="fill-on-brand"
        fillOpacity="0.95"
      />
      <circle cx="16" cy="16" r="1.9" className="fill-brand" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-ink">
        Campus<span className="text-brand">OS</span>
      </span>
    </span>
  )
}
