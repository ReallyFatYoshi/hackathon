import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helpers'
import { db } from '@/lib/db'

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
    return NextResponse.json(application)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
