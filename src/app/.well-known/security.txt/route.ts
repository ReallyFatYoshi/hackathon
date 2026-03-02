import { NextResponse } from 'next/server'

/**
 * security.txt (RFC 9116)
 * https://securitytxt.org/
 *
 * Tells security researchers how to report vulnerabilities.
 */
export function GET() {
  const body = [
    '# Security policy for MyChef',
    `Contact: mailto:security@mychef.nl`,
    `Preferred-Languages: en, nl`,
    `Canonical: ${process.env.NEXT_PUBLIC_APP_URL || 'https://mychef.nl'}/.well-known/security.txt`,
    `Expires: 2027-04-01T00:00:00.000Z`,
  ].join('\n')

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
