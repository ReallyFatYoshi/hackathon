import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helpers'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId } = await req.json()

  const chef = await db.chef.findUnique({ where: { userId: session.user.id } })
  if (!chef) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const result = await db.booking.updateMany({
    where: { id: bookingId, chefId: chef.id },
    data: { chefCompletedAt: new Date() },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
