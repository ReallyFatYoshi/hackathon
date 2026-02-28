import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth()

    const body = await req.json()
    const { title, eventType, date, location, guestCount, budgetMin, budgetMax, description } = body

    const event = await db.event.create({
      data: {
        clientId: user.id,
        title,
        eventType,
        date: new Date(date),
        location,
        guestCount,
        budgetMin,
        budgetMax,
        description,
        status: 'open',
      },
    })

    return NextResponse.json(event)
  } catch (error: any) {
    if (error?.digest?.includes('NEXT_REDIRECT')) throw error
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 })
  }
}
