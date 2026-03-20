import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  generateDesktopSignInToken,
  getDesktopRedirectUri,
  isSafeDesktopRedirectUri,
} from '../lib/desktop-auth'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/desktop-auth/start')({
  component: DesktopAuthStartPage,
})

function DesktopAuthStartPage() {
  const { data: session, isPending } = authClient.useSession()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const redirectUri = getDesktopRedirectUri()

    if (!isSafeDesktopRedirectUri(redirectUri)) {
      setErrorMessage('The desktop sign-in redirect URL is invalid.')
      return
    }

    const safeRedirectUri = redirectUri

    if (isPending) {
      return
    }

    if (!session?.session) {
      const callbackUrl = `/desktop-auth/start?redirect_uri=${encodeURIComponent(safeRedirectUri)}`
      window.location.assign(`/sign-in?callbackURL=${encodeURIComponent(callbackUrl)}`)
      return
    }

    let isCancelled = false

    void generateDesktopSignInToken()
      .then((token) => {
        if (isCancelled) {
          return
        }

        const handoffUrl = new URL(safeRedirectUri)
        handoffUrl.searchParams.set('token', token)
        window.location.assign(handoffUrl.toString())
      })
      .catch((error) => {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to create a desktop sign-in token.',
          )
        }
      })

    return () => {
      isCancelled = true
    }
  }, [isPending, session?.session])

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Desktop Sign-in</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Connecting your browser session to Orion desktop.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          {errorMessage ?? 'Hang on while Orion prepares a secure one-time sign-in handoff.'}
        </p>
      </section>
    </main>
  )
}
