import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

const KEY = 'campusos.theme'

interface ThemeValue {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * CampusOS is a dark product.
 *
 * The deep canvas is the environment the whole visual system is designed
 * against — depth, ambient light and the glass material all read correctly on
 * it and wash out on white. Following the OS preference meant a student on a
 * light laptop met a white portal that looked like every other university ERP,
 * so dark is the default and light is an explicit choice in Settings.
 */
const DEFAULT_THEME: Theme = 'dark'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(KEY) as Theme | null) ?? DEFAULT_THEME
    } catch {
      return DEFAULT_THEME
    }
  })
  const [systemDark, setSystemDark] = useState(() => systemPrefersDark())

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  const value = useMemo<ThemeValue>(
    () => ({
      theme,
      resolved,
      setTheme: (next) => {
        setThemeState(next)
        try {
          localStorage.setItem(KEY, next)
        } catch {
          // Non-fatal: the theme just will not persist.
        }
      },
    }),
    [theme, resolved],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
