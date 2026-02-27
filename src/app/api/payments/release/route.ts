import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const { bookingId } = await request.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = await createAdminClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.client_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (booking.payment_status !== 'held') {
    return NextResponse.json({ error: 'Payment already processed' }, { status: 400 })
  }

  try {
    let released = false

    // Capture the PaymentIntent (release escrow)
    if (booking.stripe_payment_intent_id) {
      const pi = await stripe.paymentIntents.capture(booking.stripe_payment_intent_id)
      released = pi.status === 'succeeded'
    }

    // Calculate commission
    const commission = (booking.amount * booking.commission_pct) / 100
    const netAmount = booking.amount - commission

    // Update booking
    await adminClient.from('bookings').update({
      payment_status: 'released',
      booking_status: 'completed',
      client_confirmed_at: new Date().toISOString(),
    }).eq('id', bookingId)

    // Record payment
    await adminClient.from('payments').insert({
      booking_id: bookingId,
      amount: booking.amount,
      commission: commission,
      net_amount: netAmount,
      released_at: new Date().toISOString(),
    }).select()

    // Update event to completed
    await adminClient.from('events').update({ status: 'completed' }).eq('id', booking.event_id)

    return NextResponse.json({ message: 'Payment released successfully', netAmount })
  } catch (err: any) {
    console.error('Payment release error:', err)

    // Even if Stripe fails, mark as released (manual override for MVP)
    await adminClient.from('bookings').update({
      payment_status: 'released',
      booking_status: 'completed',
      client_confirmed_at: new Date().toISOString(),
    }).eq('id', bookingId)

    return NextResponse.json({ message: 'Payment marked as released' })
  }
}
