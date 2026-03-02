import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/url'

export function GET() {
  return NextResponse.redirect(new URL('/dashboard/settings', getBaseUrl()), 302)
}
