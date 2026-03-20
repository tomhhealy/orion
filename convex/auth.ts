import { createClient, type GenericCtx } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth'
import { query } from './_generated/server'
import { components } from './_generated/api'
import type { DataModel } from './_generated/dataModel'
import authConfig from './auth.config'

const siteUrl =
  process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? 'http://localhost:3000'

export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    appName: 'Orion',
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [convex({ authConfig })],
  })

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx)
  },
})

export const { getAuthUser } = authComponent.clientApi()
