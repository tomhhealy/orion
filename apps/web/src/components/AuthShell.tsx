import { Link } from '@tanstack/react-router'

interface AuthShellProps {
  title: string
  eyebrow: string
  subtitle: string
  alternateLabel: string
  alternateHref: '/sign-in' | '/sign-up'
  alternateCta: string
  children: React.ReactNode
}

export default function AuthShell({
  title,
  eyebrow,
  subtitle,
  alternateLabel,
  alternateHref,
  alternateCta,
  children,
}: AuthShellProps) {
  return (
    <main className="page-wrap auth-page px-4 py-12">
      <section className="auth-grid">
        <div className="auth-copy island-shell rounded-[2rem] p-8 sm:p-10">
          <p className="island-kicker mb-3">{eyebrow}</p>
          <h1 className="display-title mb-4 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
            {title}
          </h1>
          <p className="m-0 max-w-xl text-base leading-8 text-[var(--sea-ink-soft)]">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/about" className="auth-chip">
              Runtime Notes
            </Link>
            <a
              href="https://labs.convex.dev/better-auth/framework-guides/tanstack-start"
              target="_blank"
              rel="noreferrer"
              className="auth-chip"
            >
              Integration Guide
            </a>
          </div>
        </div>

        <div className="island-shell rounded-[2rem] p-6 sm:p-8">
          {children}
          <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">
            {alternateLabel}{' '}
            <Link to={alternateHref} className="font-semibold text-[var(--lagoon-deep)]">
              {alternateCta}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
