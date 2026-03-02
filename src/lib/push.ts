import webpush from 'web-push'
import { db } from '@/lib/db'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_KEY!
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

webpush.setVapidDetails(`mailto:noreply@mychef.app`, VAPID_PUBLIC, VAPID_PRIVATE)

export interface PushPayload {
  title: string
  body: string
  url?: string
}

/**
 * Send a push notification to a specific user (all their subscribed devices).
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  })

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({ ...payload, url: payload.url || '/' }),
        )
      } catch (err: any) {
        // 410 Gone or 404 = subscription expired, clean up
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        }
        throw err
      }
    }),
  )

  return {
    sent: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  }
}

/**
 * Send a push notification to multiple users.
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  const results = await Promise.allSettled(
    userIds.map((uid) => sendPushToUser(uid, payload)),
  )
  return results
}
