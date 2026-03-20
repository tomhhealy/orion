import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AuthShell from '../components/AuthShell'
import { authClient } from '../lib/auth-client'
import { formatAuthError } from '../lib/auth-errors'

export const Route = createFileRoute('/sign-in')({ component: SignInPage })

function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (session?.session) {
      void navigate({ to: '/', replace: true })
    }
  }, [navigate, session?.session])

  if (isPending) {
    return null
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: '/',
      },
      {
        onSuccess: () => {
          window.location.assign('/')
        },
        onError: (ctx) => {
          setErrorMessage(formatAuthError(ctx.error))
        },
      },
    )

    setIsSubmitting(false)
  }

  return (
    <AuthShell
      title="Sign in to the shared Orion workspace."
      eyebrow="Authentication"
      subtitle="Use your Orion email and password to access the protected dashboard in both the browser and the Electron shell."
      alternateLabel="Need an account?"
      alternateHref="/sign-up"
      alternateCta="Create one"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  )
}
