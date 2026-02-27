import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
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

  const adminClient = await createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const { eventId, chefId, clientId } = session.metadata

      // Update booking with payment intent ID
      if (session.payment_intent) {
        await adminClient
          .from('bookings')
          .update({ stripe_payment_intent_id: session.payment_intent })
          .eq('event_id', eventId)
          .eq('chef_id', chefId)
          .eq('client_id', clientId)
          .eq('payment_status', 'held')
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object
      // Mark booking as cancelled if payment fails
      await adminClient
        .from('bookings')
        .update({ booking_status: 'cancelled', payment_status: 'refunded' })
        .eq('stripe_payment_intent_id', pi.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
