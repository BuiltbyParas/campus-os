import { useReducedMotion } from 'framer-motion'
import { CalendarDays, MessageSquareWarning, PartyPopper, ScanLine, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * The CampusOS intelligence core.
 *
 * This is the product thesis as an object: five fragmented campus services
 * orbiting a single intelligent centre, connected by real links. It is built
 * from CSS 3D transforms rather than WebGL — genuine depth (`preserve-3d`,
 * perspective, per-node Z) at a few kilobytes instead of a renderer, which
 * keeps it smooth on the laptops and phones a demo actually runs on.
 *
 * `converge` (0–1) pulls the nodes toward the centre. The landing page drives
 * it from scroll so the fragments visibly *become* one system — the animation
 * carries the argument rather than decorating it.
 */

interface Node {
  label: string
  icon: typeof ScanLine
  /** Degrees around the ring, 0 = right, measured clockwise. */
  angle: number
  /** Depth in the scene. Varying it is what stops the ring reading as flat. */
  depth: number
  value: string
}

/**
 * Orbit radius is derived from the container, not fixed in pixels.
 *
 * A node is roughly 150px wide, so the ring has to stop half that short of the
 * edge or the labels get clipped on a phone. `NODE_CLEARANCE` is that margin.
 */
const NODE_CLEARANCE = 84
const MAX_RADIUS = 168

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

const NODES: Node[] = [
  { label: 'Attendance', icon: ScanLine, angle: -90, depth: 60, value: '72%' },
  { label: 'Timetable', icon: CalendarDays, angle: -18, depth: -40, value: '10:00' },
  { label: 'Events', icon: PartyPopper, angle: 54, depth: 30, value: '5 PM' },
  { label: 'Complaints', icon: MessageSquareWarning, angle: 126, depth: -55, value: 'CMP-1042' },
  { label: 'Assistant', icon: Sparkles, angle: 198, depth: 45, value: 'Ask' },
]

export function IntelligenceCore({
  converge = 0,
  className,
}: {
  converge?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [width, setWidth] = useState(420)

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

  /* Nodes travel inward as the section scrolls: fragmentation → one system.
     They stop short of the centre — "unified" means gathered around the core,
     not collapsed into a single illegible point. */
  const spread = 1 - Math.min(1, Math.max(0, converge))
  const radiusPx = orbitRadius(width, spread)
  const compact = width < 380

  return (
    <div
      ref={wrapRef}
      className={cn('relative mx-auto aspect-square w-full max-w-[420px]', className)}
      style={{ perspective: '1100px' }}
      aria-hidden
    >
      {/* ambient light pooled behind the core */}
      <div className="pointer-events-none absolute inset-[18%] rounded-full bg-brand/20 blur-[70px]" />

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
        {NODES.map((node) => {
          const radians = (node.angle * Math.PI) / 180
          return (
            <div
              key={`link-${node.label}`}
              className="absolute left-1/2 top-1/2 h-px origin-left"
              style={{
                width: `${radiusPx}px`,
                transform: `translateY(-50%) rotate(${node.angle}deg) translateZ(${node.depth * spread * 0.5}px)`,
                background:
                  'linear-gradient(90deg, color-mix(in oklab, var(--brand) 55%, transparent), transparent)',
                opacity: 0.25 + converge * 0.75,
                boxShadow:
                  converge > 0.5
                    ? `0 0 ${6 + converge * 10}px color-mix(in oklab, var(--brand) ${Math.round(converge * 45)}%, transparent)`
                    : 'none',
                transition:
                  'width 700ms cubic-bezier(0.22,1,0.36,1), opacity 700ms, box-shadow 700ms',
              }}
            >
              {/* a pulse travelling inward: data arriving at the core */}
              {!reduced ? (
                <span
                  className="absolute top-1/2 size-1 -translate-y-1/2 rounded-full bg-brand"
                  style={{
                    animation: `core-pulse 3.2s ${radians}s cubic-bezier(0.4,0,0.2,1) infinite`,
                  }}
                />
              ) : null}
            </div>
          )
        })}

        {/* service nodes */}
        {NODES.map((node) => {
          const radians = (node.angle * Math.PI) / 180
          const x = Math.cos(radians) * radiusPx
          const y = Math.sin(radians) * radiusPx
          const z = node.depth * spread

          return (
            <div
              key={node.label}
              className={cn(
                'glass-thin absolute left-1/2 top-1/2 flex items-center gap-1.5 rounded-xl py-1.5',
                compact ? 'px-2' : 'gap-2 px-2.5 py-2',
              )}
              style={{
                transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) scale(${0.95 + spread * 0.05})`,
                transition: 'transform 700ms cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <node.icon className="size-3.5 shrink-0 text-brand-ink" />
              <span
                className={cn(
                  'whitespace-nowrap font-medium text-ink',
                  compact ? 'text-[10px]' : 'text-[11px]',
                )}
              >
                {node.label}
              </span>
              {/* The live value is the first thing to go when space is tight. */}
              {!compact ? (
                <span className="whitespace-nowrap text-[10.5px] tabular-nums text-ink-subtle">
                  {node.value}
                </span>
              ) : null}
            </div>
          )
        })}

        {/* the core */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{ transform: 'translate3d(-50%, -50%, 40px)', transformStyle: 'preserve-3d' }}
        >
          <div className="relative grid size-[92px] place-items-center">
            <span
              className="absolute inset-0 rounded-full bg-brand/25 blur-xl"
              style={
                reduced ? undefined : { animation: 'core-breathe 5s ease-in-out infinite' }
              }
            />
            <span
              className="absolute inset-2 rounded-full border border-brand-border/60"
              style={{
                boxShadow: `0 0 ${10 + converge * 26}px color-mix(in oklab, var(--brand) ${Math.round(
                  18 + converge * 40,
                )}%, transparent)`,
                transition: 'box-shadow 700ms',
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
