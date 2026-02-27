import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { BookOpen } from 'lucide-react'
import { MarkCompleteButton } from './mark-complete-button'

export default async function ChefBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: chef } = await supabase.from('chefs').select('id').eq('user_id', user.id).single()
  if (!chef) redirect('/dashboard/chef')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, events(*)')
    .eq('chef_id', chef.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">My Bookings</h1>
        <p className="text-stone-500 mt-1">Track your confirmed events and payments</p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500 text-sm">No bookings yet. Apply to events to get booked!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const event = booking.events as any
            const commission = (booking.amount * booking.commission_pct) / 100
            const netAmount = booking.amount - commission

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
                      <p className="text-sm text-stone-500">{formatDate(event?.date)}</p>
                      <p className="text-sm text-stone-500">{event?.location}</p>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-sm font-semibold text-stone-900">
                          Total: {formatCurrency(booking.amount)}
                        </p>
                        <p className="text-xs text-stone-400">
                          Platform fee ({booking.commission_pct}%): −{formatCurrency(commission)}
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          You receive: {formatCurrency(netAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {booking.booking_status === 'confirmed' && !booking.chef_completed_at && (
                        <MarkCompleteButton bookingId={booking.id} />
                      )}
                      {booking.chef_completed_at && !booking.client_confirmed_at && (
                        <div className="text-xs text-stone-500 text-right">
                          Awaiting client<br/>confirmation
                        </div>
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
