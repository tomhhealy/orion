import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { verifyDesktopSignInToken } from '../lib/desktop-auth'

export const Route = createFileRoute('/desktop-auth/callback')({
  component: DesktopAuthCallbackPage,
})

function DesktopAuthCallbackPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const token = new URL(window.location.href).searchParams.get('token')

    if (!token) {
      setErrorMessage('The desktop sign-in token is missing.')
      return
    }

    let isCancelled = false

    void verifyDesktopSignInToken(token)
      .then(() => {
        if (isCancelled) {
          return
        }

        // Force a full document reload so Better Auth re-reads the freshly set
        // session cookie instead of relying on stale client-side session state.
        window.location.assign('/')
      })
      .catch((error) => {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to finish desktop sign-in.',
          )
        }
      })

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Desktop Sign-in</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Finalizing your Orion desktop session.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          {errorMessage ?? 'Verifying the one-time handoff token and restoring your session.'}
        </p>
      </section>
    </main>
  )
}
