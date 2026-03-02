import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe, COMMISSION_PCT } from '@/lib/stripe'
import { sendBookingConfirmedEmail } from '@/lib/email'
import { sendPushToUser } from '@/lib/push'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { applicationId, eventId, chefId, amount } = body

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user

  // Verify event belongs to client
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { client: true },
  })
  if (!event || event.clientId !== user.id) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  // Get chef details
  const chef = await db.chef.findUnique({ where: { id: chefId } })
  if (!chef) return NextResponse.json({ error: 'Chef not found' }, { status: 404 })

  const bookingAmount = Math.round(Number(amount) * 100) // in cents

  try {
    // Create Stripe Checkout Session with manual payment capture (escrow-like)
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Chef Booking: ${event.title}`,
              description: `Chef: ${chef.firstName} ${chef.lastName} · ${new Date(event.date).toLocaleDateString()}`,
            },
            unit_amount: bookingAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId,
        chefId,
        clientId: user.id,
        applicationId,
        commissionPct: COMMISSION_PCT.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client/bookings?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client/events/${eventId}?payment=cancelled`,
      payment_intent_data: {
        capture_method: 'manual', // Authorize only — capture after completion
        metadata: {
          eventId,
          chefId,
          clientId: user.id,
        },
      },
    })

    // Create booking record (payment status = held when webhook fires)
    const booking = await db.booking.create({
      data: {
        eventId,
        chefId,
        clientId: user.id,
        amount: Number(amount),
        commissionPct: COMMISSION_PCT,
        paymentStatus: 'held',
        bookingStatus: 'confirmed',
        stripePaymentIntentId: null, // will be set by webhook
      },
    })

    // Accept the application, reject others
    await db.eventApplication.update({ where: { id: applicationId }, data: { status: 'accepted' } })
    await db.eventApplication.updateMany({
      where: { eventId, id: { not: applicationId } },
      data: { status: 'rejected' },
    })

    // Mark event as filled
    await db.event.update({ where: { id: eventId }, data: { status: 'filled' } })

    // Send confirmation email
    try {
      const client = event.client
      await sendBookingConfirmedEmail(
        client?.email || '',
        client?.name || '',
        `${chef.firstName} ${chef.lastName}`,
        event.title,
        new Date(event.date).toLocaleDateString()
      )
    } catch (e) { console.error(e) }

    // Push notification to chef
    sendPushToUser(chef.userId, {
      title: 'New Booking Confirmed!',
      body: `You've been hired for "${event.title}"`,
      url: '/dashboard/chef/bookings',
    }).catch(() => {})

    return NextResponse.json({ checkoutUrl: stripeSession.url, bookingId: booking.id })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
