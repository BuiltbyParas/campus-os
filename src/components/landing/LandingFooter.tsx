import { Logo } from '@/components/layout/Logo'
import { footerLinks } from '@/data/landing'

import { Container } from './primitives'

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-surface-muted/40">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-muted">
              One intelligent system for everything students need on campus.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.heading}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                {group.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13.5px] text-ink-muted transition-colors duration-150 hover:text-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-ink-subtle">
            CampusOS — a Smart India Hackathon 2026 project.
          </p>
          <p className="text-[12px] text-ink-subtle">
            All figures shown are demo data, not real institutional records.
          </p>
        </div>
      </Container>
    </footer>
  )
}
