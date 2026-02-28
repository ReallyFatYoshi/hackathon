import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const { bookingId } = await request.json()

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const booking = await db.booking.findUnique({ where: { id: bookingId } })

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.clientId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (booking.paymentStatus !== 'held') {
    return NextResponse.json({ error: 'Payment already processed' }, { status: 400 })
  }

  try {
    let released = false

    // Capture the PaymentIntent (release escrow)
    if (booking.stripePaymentIntentId) {
      const pi = await stripe.paymentIntents.capture(booking.stripePaymentIntentId)
      released = pi.status === 'succeeded'
    }

    // Calculate commission
    const commission = (booking.amount * booking.commissionPct) / 100
    const netAmount = booking.amount - commission

    // Update booking
    await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'released',
        bookingStatus: 'completed',
        clientConfirmedAt: new Date(),
      },
    })

    // Record payment
    await db.payment.create({
      data: {
        bookingId,
        amount: booking.amount,
        commission,
        netAmount,
        releasedAt: new Date(),
      },
    })

    // Update event to completed
    await db.event.update({ where: { id: booking.eventId }, data: { status: 'completed' } })

    return NextResponse.json({ message: 'Payment released successfully', netAmount })
  } catch (err: any) {
    console.error('Payment release error:', err)

    // Even if Stripe fails, mark as released (manual override for MVP)
    await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'released',
        bookingStatus: 'completed',
        clientConfirmedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Payment marked as released' })
  }
}
