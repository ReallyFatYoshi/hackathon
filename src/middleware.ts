import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']
const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

const intlMiddleware = createIntlMiddleware(routing)

/** Generate a random hex token using Web Crypto (Edge-compatible) */
function generateToken(): string {
  const buf = new Uint8Array(32)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Strip the locale prefix from a pathname (e.g. /nl/dashboard → /dashboard) */
function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(`/${locale}`.length) || '/'
    }
  }
  return pathname
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let auth API routes through (better-auth handles its own CSRF)
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // --- CSRF double-submit cookie validation ---
  if (pathname.startsWith('/api/') && !SAFE_METHODS.includes(request.method)) {
    const cookieToken = request.cookies.get(CSRF_COOKIE)?.value
    const headerToken = request.headers.get(CSRF_HEADER)

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
    }
  }

  // Skip intl middleware for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    if (!request.cookies.get(CSRF_COOKIE)?.value) {
      response.cookies.set(CSRF_COOKIE, generateToken(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      })
    }
    return response
  }

  // The path without locale prefix, used for auth checks
  const bare = stripLocale(pathname)

  // Check for better-auth session cookie
  const sessionToken = request.cookies.get('better-auth.session_token')?.value

  // Protected routes
  if (bare.startsWith('/dashboard')) {
    if (!sessionToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', bare)
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages
  if (['/login', '/register', '/apply'].includes(bare)) {
    if (sessionToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Run next-intl middleware (handles locale detection + prefixing)
  const response = intlMiddleware(request)

  // Ensure CSRF cookie exists on every response
  if (!request.cookies.get(CSRF_COOKIE)?.value) {
    response.cookies.set(CSRF_COOKIE, generateToken(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
