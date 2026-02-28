import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let auth API routes through
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Check session via better-auth
  const session = await auth.api.getSession({ headers: request.headers })

  // Protected routes
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages
  if (['/login', '/register'].includes(pathname)) {
    if (session) {
      const role = (session.user as any).role || 'client'
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role === 'admin' ? 'admin' : role === 'chef' ? 'chef' : 'client'}`
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
