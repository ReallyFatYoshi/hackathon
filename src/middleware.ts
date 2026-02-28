import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let auth API routes through
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
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
  if (['/login', '/register'].includes(pathname)) {
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
