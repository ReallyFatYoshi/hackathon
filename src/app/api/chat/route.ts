import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { booking_id, content } = await request.json()
  if (!booking_id || !content?.trim()) {
    return NextResponse.json({ error: 'booking_id and content required' }, { status: 400 })
  }

  // Verify user is participant in this booking
  const booking = await db.booking.findUnique({
    where: { id: booking_id },
    include: { chef: { select: { userId: true } } },
  })

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  if (session.user.id !== booking.clientId && session.user.id !== booking.chef.userId) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  const message = await db.message.create({
    data: {
      bookingId: booking_id,
      senderId: session.user.id,
      content: content.trim(),
      type: 'text',
    },
  })

  // Trigger Pusher event for realtime
  await pusherServer.trigger(`chat-${booking_id}`, 'new-message', {
    id: message.id,
    booking_id: message.bookingId,
    sender_id: message.senderId,
    content: message.content,
    type: message.type,
    created_at: message.createdAt.toISOString(),
  })

  return NextResponse.json({
    id: message.id,
    booking_id: message.bookingId,
    sender_id: message.senderId,
    content: message.content,
    type: message.type,
    created_at: message.createdAt.toISOString(),
  })
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const booking_id = searchParams.get('booking_id')
  if (!booking_id) return NextResponse.json({ error: 'booking_id required' }, { status: 400 })

  const booking = await db.booking.findUnique({
    where: { id: booking_id },
    include: { chef: { select: { userId: true } } },
  })

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  if (session.user.id !== booking.clientId && session.user.id !== booking.chef.userId) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }

  const messages = await db.message.findMany({
    where: { bookingId: booking_id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages.map((m) => ({
    id: m.id,
    booking_id: m.bookingId,
    sender_id: m.senderId,
    content: m.content,
    type: m.type,
    created_at: m.createdAt.toISOString(),
  })))
}
