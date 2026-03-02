import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

/**
 * POST /api/notifications/subscribe
 * Register a push subscription for the authenticated user.
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { endpoint, keys } = body

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  // Upsert: update if endpoint already exists, create otherwise
  await db.pushSubscription.upsert({
    where: { endpoint },
    update: {
      userId: session.user.id,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    create: {
      userId: session.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  })

  return NextResponse.json({ ok: true })
}

/**
 * DELETE /api/notifications/subscribe
 * Unsubscribe the current device from push notifications.
 */
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { endpoint } = body

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
  }

  await db.pushSubscription
    .delete({ where: { endpoint } })
    .catch(() => {})

  return NextResponse.json({ ok: true })
}
