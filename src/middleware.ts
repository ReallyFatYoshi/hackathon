import { NextRequest, NextResponse } from 'next/server'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

function checkCsrf(request: NextRequest): boolean {
  if (SAFE_METHODS.includes(request.method)) return true
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  if (!origin && !referer) return false
  const allowedHost = host || 'localhost:3000'
  if (origin) {
    try { if (new URL(origin).host !== allowedHost) return false } catch { return false }
  }
  if (referer && !origin) {
    try { if (new URL(referer).host !== allowedHost) return false } catch { return false }
  }
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let auth API routes through (better-auth handles its own CSRF)
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // CSRF check on all mutating API requests
  if (pathname.startsWith('/api/') && !checkCsrf(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
