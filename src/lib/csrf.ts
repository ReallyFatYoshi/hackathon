import { NextRequest } from 'next/server'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

/**
 * Validates the request origin matches the app URL to prevent CSRF attacks.
 * Returns true if the request is safe, false if it should be rejected.
 */
export function validateCsrf(request: NextRequest): boolean {
  if (SAFE_METHODS.includes(request.method)) return true

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  // At least one of origin or referer must be present
  if (!origin && !referer) return false

  const allowedHost = host || new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').host

  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (originHost !== allowedHost) return false
    } catch {
      return false
    }
  }

  if (referer && !origin) {
    try {
      const refererHost = new URL(referer).host
      if (refererHost !== allowedHost) return false
    } catch {
      return false
    }
  }

  return true
}
