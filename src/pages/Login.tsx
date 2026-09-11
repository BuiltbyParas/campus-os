import { ArrowLeft, ArrowRight, Check, Loader2, Lock, Mail } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { IntelligenceCore } from '@/components/core/IntelligenceCore'
import { Glow } from '@/components/landing/primitives'
import { Logo } from '@/components/layout/Logo'
import { LandingLayout } from '@/layouts/LandingLayout'
import { cn } from '@/lib/utils'

/**
 * Demo sign-in. There is no auth backend yet, so this validates locally and
 * then enters the workspace — the shape of the screen is what a real provider
 * will slot into later.
 *
 * The screen is deliberately staged rather than centred: the left half is the
 * product making its claim one last time, the right half is the single task.
 * Below `lg` the stage collapses and the form takes the whole screen, because
 * on a phone the only thing that matters is signing in.
 */
/**
 * `idle → submitting → success → (navigate)`, or back to `idle` on a rejected
 * form. The success beat is short but deliberate: a sign-in that jumps straight
 * to the dashboard reads as a page error, while one that confirms first reads
 * as a door opening.
 */
type Status = 'idle' | 'submitting' | 'success'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  /* Timers are cleared on unmount so a fast navigation cannot leave one
     firing against a component that is gone. */
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (status !== 'idle') return

    if (!email.trim() || !password.trim()) {
      setError('Enter your campus email and password to continue.')
      return
    }

    setError(null)
    setStatus('submitting')

    // Stands in for the future auth request.
    timers.current.push(
      window.setTimeout(() => setStatus('success'), 620),
      window.setTimeout(() => navigate('/app'), 1180),
    )
  }

  const submitting = status === 'submitting'
  const success = status === 'success'

  return (
    <LandingLayout chrome={false}>
      <div className="relative min-h-dvh lg:grid lg:grid-cols-[1.1fr_minmax(0,520px)]">
        <Stage />

        {/* ------------------------------------------------------------ form */}
        <div className="relative flex min-h-dvh flex-col justify-center px-5 py-14 sm:px-8 lg:min-h-0 lg:border-l lg:border-line lg:bg-surface-muted/40">
          {/* the ambient wash only exists on small screens, where the stage
              beside the form is gone and the page would otherwise be flat */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
            <div className="absolute inset-0 bg-mesh opacity-50 mask-fade-radial" />
            <Glow className="left-1/2 top-[-140px] h-[380px] w-[620px] -translate-x-1/2" />
          </div>

          <div className="relative mx-auto w-full max-w-[400px]">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>

            <div
              className={cn(
                'rounded-2xl border border-line bg-surface p-7 shadow-e4 edge-highlight transition-[opacity,transform] duration-500 sm:p-8',
                success && 'scale-[0.985] opacity-80',
              )}
            >
              <Logo />

              <h1 className="mt-7 text-[22px] font-semibold tracking-[-0.02em] text-ink">
                Welcome back
              </h1>
              <p className="mt-2 text-[14px] text-ink-muted">
                Sign in with your campus ID to open your workspace.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
                <Field
                  id="email"
                  label="Campus email"
                  type="email"
                  placeholder="you@campus.edu"
                  icon={<Mail className="size-4" />}
                  value={email}
                  onChange={setEmail}
                  autoComplete="username"
                  disabled={status !== 'idle'}
                  invalid={Boolean(error) && !email.trim()}
                />
                <Field
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="size-4" />}
                  value={password}
                  onChange={setPassword}
                  autoComplete="current-password"
                  disabled={status !== 'idle'}
                  invalid={Boolean(error) && !password.trim()}
                />

                {error ? (
                  <p role="alert" className="text-[13px] text-danger-ink">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status !== 'idle'}
                  aria-busy={submitting || undefined}
                  className={cn(
                    'group inline-flex h-11 w-full items-center justify-center gap-2 rounded-control text-[15px] font-medium text-on-brand shadow-[0_0_0_1px_var(--brand-border),0_14px_40px_-16px_var(--brand)] transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none',
                    success
                      ? 'bg-ok shadow-[0_0_0_1px_var(--ok),0_14px_40px_-16px_var(--ok)]'
                      : 'bg-brand hover:bg-brand-hover hover:shadow-[0_0_0_1px_var(--brand-border),0_18px_48px_-14px_var(--brand)]',
                    submitting && 'opacity-80',
                  )}
                >
                  {success ? (
                    <>
                      <Check className="size-4" aria-hidden />
                      Signed in
                    </>
                  ) : submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Opening workspace
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-line pt-5">
                <Link
                  to="/app"
                  className="inline-flex h-11 w-full items-center justify-center rounded-control border border-line bg-canvas/40 text-[14px] font-medium text-ink transition-colors hover:border-line-strong"
                >
                  Continue as demo student
                </Link>
              </div>
            </div>

            <p aria-live="polite" className="sr-only">
              {success ? 'Signed in. Opening your workspace.' : submitting ? 'Signing in' : ''}
            </p>

            <p className="mt-6 text-center text-[12px] text-ink-subtle">
              Demo environment — no real credentials are checked or stored.
            </p>
          </div>
        </div>
      </div>
    </LandingLayout>
  )
}

/** What CampusOS assembles the moment the student is through the door. */
const PROOF = [
  { value: '5', label: 'campus services read together' },
  { value: '1', label: 'timeline instead of four tabs' },
  { value: '0', label: 'portals to check before class' },
]

/**
 * The left half: the core, lit and already converged, over a pointer-tracked
 * spotlight. Hidden below `lg` — it is atmosphere, and atmosphere should never
 * push the sign-in button below the fold on a phone.
 */
function Stage() {
  const ref = useRef<HTMLDivElement>(null)
  const [spot, setSpot] = useState({ x: 50, y: 42 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(hover: none)').matches) return

    let frame = 0
    function onMove(event: PointerEvent) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = el!.getBoundingClientRect()
        setSpot({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        })
      })
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-14 xl:px-20"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        {/* the spotlight follows the pointer, so the whole panel reacts rather
            than just the object in the middle of it */}
        <div
          className="absolute inset-0 transition-[background] duration-300"
          style={{
            background: `radial-gradient(560px circle at ${spot.x}% ${spot.y}%, color-mix(in oklab, var(--brand) 16%, transparent), transparent 70%)`,
          }}
        />
        <Glow className="left-[-10%] top-[-10%] h-[420px] w-[520px] opacity-70" />
        <Glow color="info" className="bottom-[-8%] right-[-6%] h-[380px] w-[440px] opacity-50" />
      </div>

      <div className="relative">
        <Logo />

        <h2 className="mt-10 max-w-[13ch] text-[44px] font-semibold leading-[1.05] tracking-[-0.035em] xl:text-[52px]">
          <span className="block text-gradient">Your campus.</span>
          <span className="block text-gradient-brand">One intelligent system.</span>
        </h2>

        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-muted">
          Attendance, timetable, complaints and events stop being four places to check and become
          one answer to one question: what do you need right now?
        </p>

        <IntelligenceCore converge={1} className="my-8 max-w-[380px] xl:my-10" />

        <dl className="flex max-w-md gap-8 border-t border-line pt-6">
          {PROOF.map((item) => (
            <div key={item.label}>
              <dt className="text-[26px] font-semibold leading-none tracking-tight text-ink">
                {item.value}
              </dt>
              <dd className="mt-1.5 max-w-[14ch] text-[12px] leading-snug text-ink-subtle">
                {item.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  type,
  placeholder,
  icon,
  value,
  onChange,
  autoComplete,
  disabled,
  invalid,
}: {
  id: string
  label: string
  type: string
  placeholder: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  disabled?: boolean
  invalid?: boolean
}) {
  const filled = value.trim().length > 0

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink-muted">
        {label}
      </label>
      <div className="relative">
        {/* The icon picks up the accent once there is something in the field —
            a quiet "this one's done" that costs no extra chrome. */}
        <span
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200',
            invalid ? 'text-danger' : filled ? 'text-brand-ink' : 'text-ink-subtle',
          )}
        >
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'h-11 w-full rounded-control border bg-canvas/50 pl-10 pr-3 text-[14px] text-ink placeholder:text-ink-subtle/70 transition-[border-color,box-shadow,opacity] duration-150 focus:outline-none focus-visible:outline-none disabled:opacity-60',
            invalid
              ? 'border-danger/60 focus:border-danger'
              : 'border-line focus:border-brand-border focus:shadow-[0_0_0_3px_var(--brand-soft)]',
          )}
        />
      </div>
    </div>
  )
}
