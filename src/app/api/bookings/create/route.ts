import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { stripe, COMMISSION_PCT } from '@/lib/stripe'
import { sendBookingConfirmedEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { applicationId, eventId, chefId, amount } = body

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = await createAdminClient()

  // Verify event belongs to client
  const { data: event } = await supabase.from('events').select('*, profiles(*)').eq('id', eventId).single()
  if (!event || event.client_id !== user.id) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  // Get chef details
  const { data: chef } = await adminClient.from('chefs').select('*').eq('id', chefId).single()
  if (!chef) return NextResponse.json({ error: 'Chef not found' }, { status: 404 })

  const bookingAmount = Math.round(Number(amount) * 100) // in cents

  try {
    // Create Stripe Checkout Session with manual payment capture (escrow-like)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Chef Booking: ${event.title}`,
              description: `Chef: ${chef.first_name} ${chef.last_name} · ${new Date(event.date).toLocaleDateString()}`,
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
    const { data: booking, error: bookingError } = await adminClient.from('bookings').insert({
      event_id: eventId,
      chef_id: chefId,
      client_id: user.id,
      amount: Number(amount),
      commission_pct: COMMISSION_PCT,
      payment_status: 'held',
      booking_status: 'confirmed',
      stripe_payment_intent_id: null, // will be set by webhook
    }).select().single()

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    // Accept the application, reject others
    await adminClient.from('event_applications').update({ status: 'accepted' }).eq('id', applicationId)
    await adminClient.from('event_applications')
      .update({ status: 'rejected' })
      .eq('event_id', eventId)
      .neq('id', applicationId)

    // Mark event as filled
    await adminClient.from('events').update({ status: 'filled' }).eq('id', eventId)

    // Send confirmation email
    try {
      const profile = event.profiles as any
      await sendBookingConfirmedEmail(
        profile?.email || '',
        profile?.full_name || '',
        `${chef.first_name} ${chef.last_name}`,
        event.title,
        new Date(event.date).toLocaleDateString()
      )
    } catch (e) { console.error(e) }

    return NextResponse.json({ checkoutUrl: session.url, bookingId: booking.id })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
