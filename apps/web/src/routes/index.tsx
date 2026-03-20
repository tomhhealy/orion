import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { api } from '@convex/_generated/api'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const navigate = useNavigate()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { data: currentUser } = useQuery({
    ...convexQuery(api.auth.getCurrentUser, {}),
    enabled: Boolean(session?.session),
  })
  const runtimeInfo =
    typeof window === 'undefined' ? undefined : window.desktopBridge?.getRuntimeInfo()

  useEffect(() => {
    if (!isSessionPending && !session?.session) {
      void navigate({ to: '/sign-in', replace: true })
    }
  }, [isSessionPending, navigate, session?.session])

  if (isSessionPending) {
    return (
      <main className="page-wrap px-4 pb-8 pt-14">
        <section className="island-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
          <p className="island-kicker mb-3">Loading</p>
          <p className="m-0 text-base text-[var(--sea-ink-soft)]">
            Checking your Orion session.
          </p>
        </section>
      </main>
    )
  }

  if (!session?.session) {
    return (
      <main className="page-wrap px-4 pb-8 pt-14">
        <section className="island-shell rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
          <p className="island-kicker mb-3">Redirecting</p>
          <p className="m-0 text-base text-[var(--sea-ink-soft)]">
            Sending you to the sign-in screen.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Authenticated Dashboard</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Orion web is now gated behind Better Auth.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Signed in as <strong>{currentUser?.email ?? 'unknown user'}</strong>. The
          same protected route tree now backs both the browser build and the
          Electron shell.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/about"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            Runtime Notes
          </a>
          <a
            href="https://tanstack.com/start/latest/docs/framework/react/getting-started"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            TanStack Start Docs
          </a>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            'Shared Renderer',
            'Desktop and browser users now share the same authenticated route tree.',
          ],
          [
            'Convex Ready',
            'Protected user state is sourced from Convex queries during SSR and hydration.',
          ],
          [
            'Better Auth',
            'Email/password registration and sign-in are now live for Orion users.',
          ],
          [
            'Thin Desktop Shell',
            'Electron still owns only native lifecycle and preload responsibilities.',
          ],
        ].map(([title, desc], index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {title}
            </h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{desc}</p>
          </article>
        ))}
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">Desktop Bridge</p>
        <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
          {runtimeInfo
            ? `Running inside Electron on ${runtimeInfo.platform}/${runtimeInfo.arch} with Electron ${runtimeInfo.electronVersion}.`
            : 'Running in the browser without the desktop preload bridge.'}
        </p>
      </section>
    </main>
  )
}
