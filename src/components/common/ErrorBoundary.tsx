import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Last line of defence: a render error shows a recoverable screen rather than a
 * blank page. Judges should never see a white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[CampusOS] Unhandled render error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="grid min-h-dvh place-items-center bg-canvas px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold text-ink">This screen ran into a problem</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Something unexpected happened while rendering. Reloading usually clears it.
          </p>
          {import.meta.env.DEV ? (
            <pre className="mt-4 max-h-40 overflow-auto rounded-tile bg-surface-muted p-3 text-left text-xs text-ink-muted">
              {this.state.error.message}
            </pre>
          ) : null}
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="secondary" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
            <Button onClick={() => window.location.assign('/')}>Back to Home</Button>
          </div>
        </div>
      </div>
    )
  }
}
