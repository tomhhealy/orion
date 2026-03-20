import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import AuthShell from '../components/AuthShell'
import { authClient } from '../lib/auth-client'
import { formatAuthError } from '../lib/auth-errors'
import { getGuestRedirectPath } from '../lib/auth-routing'

export const Route = createFileRoute('/sign-up')({
  beforeLoad: ({ context }) => {
    const redirectPath = getGuestRedirectPath(context.isAuthenticated)
    if (redirectPath) {
      throw redirect({ to: redirectPath })
    }
  },
  component: SignUpPage,
})

function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    await authClient.signUp.email(
      {
        name,
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
      title="Create an Orion account."
      eyebrow="Registration"
      subtitle="This first pass keeps auth intentionally minimal: email, password, and immediate access to the protected workspace after registration."
      alternateLabel="Already have an account?"
      alternateHref="/sign-in"
      alternateCta="Sign in instead"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Name</span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
