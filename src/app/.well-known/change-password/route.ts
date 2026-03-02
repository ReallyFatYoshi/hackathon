import { NextResponse } from 'next/server'

/**
 * W3C Well-Known URL for Changing Passwords
 * https://w3c.github.io/webappsec-change-password-url/
 *
 * Password managers (1Password, Safari, Chrome, etc.) use this
 * endpoint to direct users to the password change page.
 */
export function GET() {
  return NextResponse.redirect(new URL('/dashboard/settings', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), 302)
}
