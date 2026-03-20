export function formatAuthError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string' && error.message.length > 0) {
      return error.message
    }

    if ('error' in error && typeof error.error === 'object' && error.error !== null) {
      const nestedError = error.error as { message?: unknown }
      if (typeof nestedError.message === 'string' && nestedError.message.length > 0) {
        return nestedError.message
      }
    }
  }

  return 'Authentication failed. Please try again.'
}
