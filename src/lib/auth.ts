import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import {
  twoFactor,
  haveIBeenPwned,
  multiSession,
  admin,
  bearer,
  openAPI,
} from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'
import { db } from './db'
import {
  ac,
  admin as adminRole,
  client as clientRole,
  chef as chefRole,
} from './auth-permissions'

export const auth = betterAuth({
  appName: 'MyChef',
  database: prismaAdapter(db, { provider: 'postgresql' }),

  // ── OWASP A07: Identification and Authentication Failures ──────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: false,
  },

  // ── OWASP A07 / A04: Rate Limiting & Account Lockout ──────────────
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: 'database',
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 3 },
      '/request-password-reset': { window: 60, max: 3 },
      '/change-password': { window: 60, max: 3 },
      '/two-factor/*': { window: 60, max: 5 },
      '/admin/*': { window: 60, max: 30 },
    },
  },

  plugins: [
    // ── OWASP A07: Multi-Factor Authentication ───────────────────────
    twoFactor({
      issuer: 'MyChef',
      skipVerificationOnEnable: false,
    }),

    // ── OWASP A07: Password Breach Detection ─────────────────────────
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        'This password has appeared in a known data breach. Please choose a different password.',
    }),

    // ── Session Management ───────────────────────────────────────────
    multiSession({
      maximumSessions: 5,
    }),

    // ── OWASP A07: WebAuthn / Passkey ────────────────────────────────
    passkey({
      rpName: 'MyChef',
    }),

    // ── OWASP A01: Broken Access Control – Admin RBAC ────────────────
    admin({
      ac,
      roles: {
        admin: adminRole,
        client: clientRole,
        chef: chefRole,
      },
      defaultRole: 'client',
    }),

    // ── OWASP A07/A08: Bearer Token Authentication ───────────────────
    bearer({
      requireSignature: true,
    }),

    // ── OWASP A05: Security Misconfiguration – API Docs ──────────────
    openAPI(),
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

  // ── OWASP A07: Session Hardening ───────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh session every 24 hours
    freshAge: 60 * 10, // 10 min – sensitive ops require re-auth
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5-minute signed cache
      strategy: 'jwe', // encrypted cookie (OWASP A02)
    },
  },

  // ── OWASP A09: Security Logging ────────────────────────────────────
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          console.info(
            `[AUDIT] session.create userId=${session.userId} ip=${session.ipAddress}`
          )
        },
      },
      delete: {
        after: async (session) => {
          console.info(`[AUDIT] session.delete userId=${session.userId}`)
        },
      },
    },
    user: {
      update: {
        after: async (user) => {
          console.info(`[AUDIT] user.update id=${user.id} email=${user.email}`)
        },
      },
    },
  },

  // ── OWASP A07: IP Address Handling ─────────────────────────────────
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
      ipv6Subnet: 64,
    },
  },
})
