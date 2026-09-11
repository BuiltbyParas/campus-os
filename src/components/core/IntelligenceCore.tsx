import { useReducedMotion } from 'framer-motion'
import {
  CalendarDays,
  CalendarRange,
  MessageSquareWarning,
  ScanLine,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { SignalTone } from '@/types'

/**
 * The CampusOS intelligence core.
 *
 * This is the product thesis as an object: the fragmented campus services
 * orbiting a single intelligent centre, connected by real links. It is built
 * from CSS 3D transforms rather than WebGL — genuine depth (`preserve-3d`,
 * perspective, per-node Z) at a few kilobytes instead of a renderer, which
 * keeps it smooth on the laptops and phones a demo actually runs on.
 *
 * It has two modes:
 *
 *   decorative  (default) — the landing page's illustration. Inert, hidden
 *                           from assistive tech, driven only by `converge`.
 *   interactive           — the dashboard's command centre. Every node is a
 *                           real link into the surface it represents, with
 *                           hover/focus raising it out of the plane, lighting
 *                           its connector and revealing what it carries.
 *
 * `converge` (0–1) pulls the nodes toward the centre. The landing page drives
 * it from scroll so the fragments visibly *become* one system — the animation
 * carries the argument rather than decorating it.
 */

export interface CoreNode {
  id: string
  label: string
  /** Used instead of `label` once the ring is crowded. */
  shortLabel?: string
  icon: LucideIcon
  /** The live figure this service contributes to the student's context. */
  value: string
  /** One line explaining what the core reads from this service. */
  detail?: string
  /**
   * The state this service is currently in.
   *
   * This is what stops the core being an ornament: a node is lit by what is
   * actually true — attendance below the line burns red, a class starting soon
   * glows, a request in progress sits amber — so the ring is readable as the
   * student's situation before a single label is read.
   */
  tone?: SignalTone
  /** Where clicking the node goes. Omit to leave the node inert. */
  to?: string
  /** Depth in the scene. Varying it is what stops the ring reading as flat. */
  depth?: number
}

/**
 * The decorative set used by the marketing surface.
 *
 * These are fixed demo figures chosen to show the *shape* of a student's
 * context before anyone has signed in — they are illustrative, and the app
 * itself always renders the live values instead.
 */
export const showcaseCoreNodes: CoreNode[] = [
  { id: 'attendance', label: 'Attendance', icon: ScanLine, value: '72%', depth: 60 },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays, value: '10:00', depth: -40 },
  { id: 'events', label: 'Events', icon: CalendarRange, value: '5 PM', depth: 30 },
  { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning, value: 'CMP-1042', depth: -55 },
  { id: 'assistant', label: 'Assistant', icon: Sparkles, value: 'Ask', depth: 45 },
]

/**
 * Orbit radius is derived from the container, not fixed in pixels.
 *
 * A node is roughly 150px wide, so the ring has to stop half that short of the
 * edge or the labels get clipped on a phone. `NODE_CLEARANCE` is that margin.
 */
const NODE_CLEARANCE = 84
const MAX_RADIUS = 168

/** Per-state colour for a node, its connector and its halo. */
const TONE_VAR: Record<SignalTone, string> = {
  info: 'var(--brand)',
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  danger: 'var(--danger)',
}

const TONE_ICON: Record<SignalTone, string> = {
  info: 'text-brand-ink',
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
}

function orbitRadius(width: number, spread: number) {
  const max = Math.max(48, Math.min(MAX_RADIUS, width / 2 - NODE_CLEARANCE))
  /* The ring barely tightens. Five labels cannot share a small circle without
     colliding — and more importantly, unification here does not mean the
     services merge into one blob. They stay themselves and become *connected*,
     which is also the honest claim: CampusOS sits underneath the five that
     already exist. The convergence is carried by the links, not by collapse. */
  const min = max * 0.88
  return min + (max - min) * spread
}

/** Evenly distributed around the ring, starting at the top. */
function angleFor(index: number, total: number) {
  return -90 + (360 / total) * index
}

/**
 * Past five nodes the chips stop fitting on a single circle, so alternate ones
 * are drawn closer in. That buys the horizontal room back without shrinking the
 * scene, and on a ring already tilted in 3D it reads as depth rather than as a
 * layout compromise.
 */
const DENSE_THRESHOLD = 5
const INNER_RING_SCALE = 0.62

function ringScale(index: number, total: number) {
  if (total <= DENSE_THRESHOLD) return 1
  return index % 2 === 0 ? 1 : INNER_RING_SCALE
}

export function IntelligenceCore({
  converge = 0,
  className,
  interactive = false,
  nodes = showcaseCoreNodes,
  onActiveChange,
}: {
  converge?: number
  className?: string
  interactive?: boolean
  nodes?: CoreNode[]
  /** Fires as hover/focus moves, so a caller can mirror the state elsewhere. */
  onActiveChange?: (node: CoreNode | null) => void
}) {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [width, setWidth] = useState(420)
  const [activeId, setActiveId] = useState<string | null>(null)
  const labelId = useId()

  /* The ring scales with the box, so the labels never run off a narrow screen. */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* Pointer parallax. Clamped hard: the scene should feel responsive, not
     swing about. Disabled entirely for reduced motion and on touch, where
     there is no hover to respond to. */
  useEffect(() => {
    if (reduced) return
    const el = wrapRef.current
    if (!el) return
    if (window.matchMedia('(hover: none)').matches) return

    let frame = 0
    function onMove(event: PointerEvent) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = el!.getBoundingClientRect()
        const px = (event.clientX - rect.left) / rect.width - 0.5
        const py = (event.clientY - rect.top) / rect.height - 0.5
        setTilt({ x: -py * 14, y: px * 16 })
      })
    }
    function onLeave() {
      cancelAnimationFrame(frame)
      setTilt({ x: 0, y: 0 })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  function setActive(node: CoreNode | null) {
    setActiveId(node?.id ?? null)
    onActiveChange?.(node)
  }

  /* Nodes travel inward as the section scrolls: fragmentation → one system.
     They stop short of the centre — "unified" means gathered around the core,
     not collapsed into a single illegible point. */
  const spread = 1 - Math.min(1, Math.max(0, converge))
  const radiusPx = orbitRadius(width, spread)
  const dense = nodes.length > DENSE_THRESHOLD
  /* The live value is the first thing to go when space is tight. */
  const compact = width < 380 || dense
  const hasActive = activeId !== null

  return (
    <div
      ref={wrapRef}
      className={cn('relative mx-auto aspect-square w-full max-w-[420px]', className)}
      style={{ perspective: '1100px' }}
      /* In decorative mode the whole scene is an illustration of the copy
         beside it, so it stays out of the accessibility tree entirely. */
      aria-hidden={interactive ? undefined : true}
      role={interactive ? 'group' : undefined}
      aria-labelledby={interactive ? labelId : undefined}
    >
      {interactive ? (
        <span id={labelId} className="sr-only">
          CampusOS core — the campus services feeding your context. Select one to open it.
        </span>
      ) : null}

      {/* ambient light pooled behind the core */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[18%] rounded-full bg-brand/20 blur-[70px] transition-opacity duration-500"
        style={{ opacity: hasActive ? 1 : 0.75 }}
      />

      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* orbit rings, laid flat in 3D so they read as a plane not a circle */}
        {[0.72, 1].map((scale, i) => (
          <div
            key={scale}
            aria-hidden
            className="absolute left-1/2 top-1/2 rounded-full border border-line"
            style={{
              width: `${scale * 74}%`,
              height: `${scale * 74}%`,
              transform: `translate(-50%, -50%) rotateX(68deg) translateZ(${i * 18}px)`,
              opacity: 0.75 - i * 0.25,
            }}
          />
        ))}

        {/* connectors — drawn in the same 3D space, so they tilt with the scene */}
        {nodes.map((node, index) => {
          const angle = angleFor(index, nodes.length)
          const radians = (angle * Math.PI) / 180
          const length = radiusPx * ringScale(index, nodes.length)
          const depth = node.depth ?? 0
          const isActive = node.id === activeId
          const accent = TONE_VAR[node.tone ?? 'info']
          /* An active link reads as the one currently carrying data: it
             brightens and glows regardless of where the scroll convergence
             has got to, so the response to a pointer is never ambiguous. */
          const lit = Math.max(converge, isActive ? 1 : 0)
          /* A node in a non-neutral state keeps its connector lit even when
             nothing is hovered — the alert should be visible at rest. */
          const alerting = node.tone === 'warn' || node.tone === 'danger'

          return (
            <div
              key={`link-${node.id}`}
              aria-hidden
              className="absolute left-1/2 top-1/2 h-px origin-left"
              style={{
                width: `${length}px`,
                transform: `translateY(-50%) rotate(${angle}deg) translateZ(${depth * spread * 0.5}px)`,
                background: `linear-gradient(90deg, color-mix(in oklab, ${accent} 55%, transparent), transparent)`,
                opacity: hasActive && !isActive ? 0.18 : 0.25 + Math.max(lit, alerting ? 0.7 : 0) * 0.75,
                boxShadow:
                  lit > 0.5 || alerting
                    ? `0 0 ${6 + Math.max(lit, alerting ? 0.7 : 0) * 10}px color-mix(in oklab, ${accent} ${Math.round(Math.max(lit, alerting ? 0.6 : 0) * 45)}%, transparent)`
                    : 'none',
                transition:
                  'width 700ms cubic-bezier(0.22,1,0.36,1), opacity 400ms, box-shadow 400ms',
              }}
            >
              {/* a pulse travelling inward: data arriving at the core */}
              {!reduced ? (
                <span
                  className="absolute top-1/2 size-1 -translate-y-1/2 rounded-full"
                  style={{
                    background: accent,
                    animation: `core-pulse ${isActive ? '1.4s' : '3.2s'} ${radians}s cubic-bezier(0.4,0,0.2,1) infinite`,
                  }}
                />
              ) : null}
            </div>
          )
        })}

        {/* service nodes */}
        {nodes.map((node, index) => {
          const angle = angleFor(index, nodes.length)
          const radians = (angle * Math.PI) / 180
          const distance = radiusPx * ringScale(index, nodes.length)
          const x = Math.cos(radians) * distance
          const y = Math.sin(radians) * distance
          const depth = node.depth ?? 0
          const isActive = node.id === activeId
          const tone = node.tone ?? 'info'
          const accent = TONE_VAR[tone]
          const alerting = tone === 'warn' || tone === 'danger'
          /* Hover lifts the node clean out of the orbital plane toward the
             viewer — the depth cue is what makes the scene feel spatial
             rather than like a circle of buttons. */
          const z = depth * spread + (isActive ? 64 : 0)

          const chrome = cn(
            'glass-thin absolute left-1/2 top-1/2 flex items-center gap-1.5 rounded-xl py-1.5',
            compact ? 'px-2' : 'gap-2 px-2.5 py-2',
            interactive && 'cursor-pointer focus-visible:outline-none',
          )

          const style = {
            transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) scale(${
              (0.95 + spread * 0.05) * (isActive ? 1.12 : 1)
            })`,
            opacity: hasActive && !isActive ? 0.5 : 1,
            borderColor: isActive || alerting
              ? `color-mix(in oklab, ${accent} 45%, transparent)`
              : undefined,
            boxShadow: isActive
              ? `0 0 0 1px color-mix(in oklab, ${accent} 55%, transparent), 0 18px 40px -14px color-mix(in oklab, ${accent} 65%, transparent)`
              : alerting
                ? `0 0 18px -6px color-mix(in oklab, ${accent} 70%, transparent)`
                : undefined,
            transition:
              'transform 500ms cubic-bezier(0.22,1,0.36,1), opacity 300ms, box-shadow 300ms, border-color 300ms',
          } as const

          const body = (
            <>
              <node.icon
                className={cn('size-3.5 shrink-0 transition-colors', TONE_ICON[tone])}
                aria-hidden
              />
              <span
                className={cn(
                  'whitespace-nowrap font-medium text-ink',
                  compact ? 'text-[10px]' : 'text-[11px]',
                )}
              >
                {compact ? (node.shortLabel ?? node.label) : node.label}
              </span>
              {!compact ? (
                <span className="whitespace-nowrap text-[10.5px] tabular-nums text-ink-subtle">
                  {node.value}
                </span>
              ) : null}

              {/* Contextual tooltip — rendered inside the 3D scene so it tilts
                  with everything else and reads as attached to the node. */}
              {interactive && node.detail ? (
                <span
                  aria-hidden
                  className="glass pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-[172px] -translate-x-1/2 rounded-lg px-2.5 py-2 text-left"
                  style={{
                    transform: `translate(-50%, ${isActive ? '0' : '-4px'}) translateZ(24px)`,
                    opacity: isActive ? 1 : 0,
                    visibility: isActive ? 'visible' : 'hidden',
                    transition: 'opacity 200ms, transform 200ms, visibility 200ms',
                  }}
                >
                  <span className="block text-[11px] font-medium leading-snug text-ink">
                    {node.value}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] leading-snug text-ink-muted">
                    {node.detail}
                  </span>
                </span>
              ) : null}
            </>
          )

          if (interactive && node.to) {
            return (
              <Link
                key={node.id}
                to={node.to}
                className={chrome}
                style={style}
                onPointerEnter={() => setActive(node)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(node)}
                onBlur={() => setActive(null)}
              >
                {body}
                <span className="sr-only">
                  — {node.value}
                  {node.detail ? `. ${node.detail}` : ''}
                </span>
              </Link>
            )
          }

          return (
            <div key={node.id} aria-hidden className={chrome} style={style}>
              {body}
            </div>
          )
        })}

        {/* the core */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2"
          style={{ transform: 'translate3d(-50%, -50%, 40px)', transformStyle: 'preserve-3d' }}
        >
          <div className="relative grid size-[92px] place-items-center">
            <span
              className="absolute inset-0 rounded-full bg-brand/25 blur-xl"
              style={reduced ? undefined : { animation: 'core-breathe 5s ease-in-out infinite' }}
            />
            <span
              className="absolute inset-2 rounded-full border border-brand-border/60"
              style={{
                boxShadow: `0 0 ${10 + Math.max(converge, hasActive ? 1 : 0) * 26}px color-mix(in oklab, var(--brand) ${Math.round(
                  18 + Math.max(converge, hasActive ? 1 : 0) * 40,
                )}%, transparent)`,
                transition: 'box-shadow 400ms',
              }}
            />
            <span className="glass absolute inset-3 rounded-full" />
            <span className="relative text-center">
              <span className="block text-[17px] font-semibold leading-none tracking-tight text-ink">
                Campus
                <span className="text-brand-ink">OS</span>
              </span>
              <span className="mt-1 block text-[9.5px] uppercase tracking-[0.16em] text-ink-subtle">
                One layer
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
