/**
 * Resolve the application base URL.
 *
 * Priority:
 *  1. NEXT_PUBLIC_APP_URL          — explicit, always wins
 *  2. VERCEL_PROJECT_PRODUCTION_URL — set by Vercel on every deployment
 *  3. VERCEL_URL                   — per-deployment URL (preview branches)
 *  4. http://localhost:3000        — local dev fallback
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL

  // Vercel env vars don't include the protocol
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  return 'http://localhost:3000'
}
