import { describe, expect, it } from 'vitest'
import { getGuestRedirectPath, getProtectedRedirectPath } from './auth-routing'

describe('auth routing guards', () => {
  it('redirects unauthenticated users away from protected routes', () => {
    expect(getProtectedRedirectPath(false)).toBe('/sign-in')
    expect(getProtectedRedirectPath(true)).toBeNull()
  })

  it('redirects authenticated users away from guest routes', () => {
    expect(getGuestRedirectPath(true)).toBe('/')
    expect(getGuestRedirectPath(false)).toBeNull()
  })
})
