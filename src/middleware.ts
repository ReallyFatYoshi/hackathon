import { NextRequest, NextResponse } from 'next/server'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']
const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

/** Generate a random hex token using Web Crypto (Edge-compatible) */
function generateToken(): string {
  const buf = new Uint8Array(32)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
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

  // Check for better-auth session cookie
  const sessionToken = request.cookies.get('better-auth.session_token')?.value

  // Protected routes
  if (pathname.startsWith('/dashboard')) {
    if (!sessionToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages
  if (['/login', '/register', '/apply'].includes(pathname)) {
    if (sessionToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Ensure CSRF cookie exists on every response
  const response = NextResponse.next()
  if (!request.cookies.get(CSRF_COOKIE)?.value) {
    response.cookies.set(CSRF_COOKIE, generateToken(), {
      httpOnly: false,  // JS must be able to read it
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
