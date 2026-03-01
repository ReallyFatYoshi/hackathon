import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'
import { multiSessionClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'

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
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient
