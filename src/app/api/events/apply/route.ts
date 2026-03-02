import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { sendPushToUser } from '@/lib/push'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId, chefId, message } = await req.json()

  const chef = await db.chef.findUnique({ where: { userId: session.user.id } })
  if (!chef || chef.id !== chefId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const application = await db.eventApplication.create({
      data: { eventId, chefId, message, status: 'pending' },
    })

    // Notify the event owner about the new application
    const event = await db.event.findUnique({ where: { id: eventId } })
    if (event) {
      sendPushToUser(event.clientId, {
        title: 'New Chef Application',
        body: `A chef applied to "${event.title}"`,
        url: `/dashboard/client/events/${eventId}`,
      }).catch(() => {})
    }

    return NextResponse.json(application)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
