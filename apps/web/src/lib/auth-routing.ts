export function getProtectedRedirectPath(isAuthenticated: boolean) {
  return isAuthenticated ? null : '/sign-in'
}

export function getGuestRedirectPath(isAuthenticated: boolean) {
  return isAuthenticated ? '/' : null
}
