'use client'

const CSRF_COOKIE = 'csrf_token'

/** Read the CSRF token from the cookie set by middleware */
function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

/**
 * Drop-in replacement for fetch that automatically attaches the CSRF token
 * header on mutating requests (POST, PUT, PATCH, DELETE).
 */
export async function csrfFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase()
  const needsToken = !['GET', 'HEAD', 'OPTIONS'].includes(method)

  if (needsToken) {
    const headers = new Headers(init?.headers)
    headers.set('X-CSRF-Token', getCsrfToken())
    return fetch(input, { ...init, headers })
  }

  return fetch(input, init)
}
