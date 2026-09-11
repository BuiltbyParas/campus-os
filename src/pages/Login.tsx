import { ArrowLeft, ArrowRight, Loader2, Lock, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Glow } from '@/components/landing/primitives'
import { Logo } from '@/components/layout/Logo'
import { LandingLayout } from '@/layouts/LandingLayout'

/**
 * Demo sign-in. There is no auth backend yet, so this validates locally and
 * then enters the workspace — the shape of the screen is what a real provider
 * will slot into later.
 */
export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('Enter your campus email and password to continue.')
      return
    }

    setError(null)
    setSubmitting(true)
    // Stands in for the future auth request.
    window.setTimeout(() => navigate('/app'), 650)
  }

  return (
    <LandingLayout chrome={false}>
      <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-50 mask-fade-radial" />
          <Glow className="left-1/2 top-[-140px] h-[380px] w-[620px] -translate-x-1/2" />
        </div>

        <div className="relative w-full max-w-[400px]">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          <div className="rounded-2xl border border-line bg-surface p-7 shadow-e4 edge-highlight sm:p-8">
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
              />

              {error ? (
                <p role="alert" className="text-[13px] text-danger-ink">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-brand text-[15px] font-medium text-on-brand transition-[background-color,transform] duration-200 hover:bg-brand-hover active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
              >
                {submitting ? (
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

          <p className="mt-6 text-center text-[12px] text-ink-subtle">
            Demo environment — no real credentials are checked or stored.
          </p>
        </div>
      </div>
    </LandingLayout>
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
}: {
  id: string
  label: string
  type: string
  placeholder: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-control border border-line bg-canvas/50 pl-10 pr-3 text-[14px] text-ink placeholder:text-ink-subtle/70 transition-colors duration-150 focus:border-brand-border focus:outline-none focus-visible:outline-none"
        />
      </div>
    </div>
  )
}
