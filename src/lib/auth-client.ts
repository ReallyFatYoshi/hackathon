import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'
import { multiSessionClient } from 'better-auth/client/plugins'
import { adminClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'
import {
  ac,
  admin as adminRole,
  client as clientRole,
  chef as chefRole,
} from './auth-permissions'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = '/2fa'
      },
    }),
    multiSessionClient(),
    passkeyClient(),
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        client: clientRole,
        chef: chefRole,
      },
    }),
  ],
  fetchOptions: {
    onError: async (ctx) => {
      if (ctx.response.status === 429) {
        const retryAfter = ctx.response.headers.get('X-Retry-After')
        console.warn(`Rate limited. Retry after ${retryAfter}s`)
      }
    },
  },
})

export const { signIn, signUp, signOut, useSession } = authClient
