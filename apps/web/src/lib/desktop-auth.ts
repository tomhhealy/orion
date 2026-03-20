export function getAuthCallbackUrl() {
  if (typeof window === 'undefined') {
    return '/'
  }

  const callbackUrl = new URL(window.location.href).searchParams.get('callbackURL')
  return callbackUrl || '/'
}

async function parseAuthError(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string; error?: { message?: string } }
    return payload.error?.message ?? payload.message ?? null
  } catch {
    return null
  }
}

export async function generateDesktopSignInToken() {
  const response = await fetch('/api/auth/one-time-token/generate', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      (await parseAuthError(response)) ?? 'Unable to create a desktop sign-in token.',
    )
  }

  const payload = (await response.json()) as { token?: string }

  if (!payload.token) {
    throw new Error('Unable to create a desktop sign-in token.')
  }

  return payload.token
}

export async function verifyDesktopSignInToken(token: string) {
  const response = await fetch('/api/auth/one-time-token/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    throw new Error(
      (await parseAuthError(response)) ?? 'Unable to finish desktop sign-in.',
    )
  }
}

export function getDesktopRedirectUri() {
  if (typeof window === 'undefined') {
    return null
  }

  return new URL(window.location.href).searchParams.get('redirect_uri')
}

export function isSafeDesktopRedirectUri(value: string | null): value is string {
  if (!value) {
    return false
  }

  try {
    const url = new URL(value)

    if (url.protocol !== 'http:') {
      return false
    }

    return url.hostname === '127.0.0.1' || url.hostname === 'localhost'
  } catch {
    return false
  }
}
