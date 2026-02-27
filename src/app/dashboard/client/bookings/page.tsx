import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { BookOpen } from 'lucide-react'
import { ConfirmCompletionButton } from './confirm-button'

export default async function ClientBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, events(*), chefs(first_name, last_name, avg_rating)')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">My Bookings</h1>
        <p className="text-stone-500 mt-1">Track your chef bookings and payment status</p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-stone-300" />
            <h3 className="font-semibold text-stone-700 mb-2">No bookings yet</h3>
            <p className="text-stone-500 text-sm">Once you select a chef for your event, your booking will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const chef = booking.chefs as any
            const event = booking.events as any
            return (
              <Card key={booking.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-stone-900">{event?.title}</h3>
                        {statusBadge(booking.booking_status)}
                        {statusBadge(booking.payment_status)}
                      </div>
                      <p className="text-sm text-stone-600 mb-1">
                        Chef: <span className="font-medium">{chef?.first_name} {chef?.last_name}</span>
                      </p>
                      <p className="text-sm text-stone-500">{formatDate(event?.date)}</p>
                      <p className="text-sm font-semibold text-stone-900 mt-1">{formatCurrency(booking.amount)}</p>
                      <p className="text-xs text-stone-400">
                        Platform commission: {booking.commission_pct}% deducted on release
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {booking.booking_status === 'confirmed' && !booking.client_confirmed_at && (
                        <ConfirmCompletionButton bookingId={booking.id} />
                      )}
                      {booking.booking_status === 'completed' && (
                        <Link href={`/dashboard/client/bookings/${booking.id}/review`}>
                          <button className="text-xs text-amber-600 font-semibold hover:underline">Leave a Review</button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
