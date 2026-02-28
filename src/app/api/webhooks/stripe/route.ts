import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { COMMISSION_PCT } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const { eventId, chefId, clientId } = session.metadata

      // Update booking with payment intent ID
      if (session.payment_intent) {
        await db.booking.updateMany({
          where: {
            eventId,
            chefId,
            clientId,
            paymentStatus: 'held',
          },
          data: { stripePaymentIntentId: session.payment_intent },
        })
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object
      // Mark booking as cancelled if payment fails
      await db.booking.updateMany({
        where: { stripePaymentIntentId: pi.id },
        data: { bookingStatus: 'cancelled', paymentStatus: 'refunded' },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
