/* eslint-disable */
import type { FunctionReference } from 'convex/server'

type AuthUser = {
  id?: string
  email?: string | null
  name?: string | null
}

export declare const api: {
  auth: {
    getCurrentUser: FunctionReference<'query', 'public', {}, AuthUser | null | undefined>
    getAuthUser: FunctionReference<'query', 'public', {}, AuthUser>
  }
}

export declare const internal: Record<string, unknown>

export declare const components: {
  betterAuth: any
}
