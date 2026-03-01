import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { twoFactor } from 'better-auth/plugins'
import { haveIBeenPwned } from 'better-auth/plugins'
import { multiSession } from 'better-auth/plugins'
import { db } from './db'

export const auth = betterAuth({
  appName: 'MyChef',
  database: prismaAdapter(db, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  plugins: [
    twoFactor({
      issuer: 'MyChef',
      skipVerificationOnEnable: false,
    }),
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        'This password has appeared in a known data breach. Please choose a different password.',
    }),
    multiSession({
      maximumSessions: 5,
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'client',
        input: true,
      },
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // update session every 24 hours
  },
})
