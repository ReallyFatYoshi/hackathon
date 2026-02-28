import { requireRole } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { BookOpen } from 'lucide-react'
import { AdminBookingActions } from './actions'

export default async function AdminBookingsPage() {
  await requireRole('admin')

  const bookings = await db.booking.findMany({
    include: { event: true, chef: true, client: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">All Bookings</h1>
        <p className="text-stone-500 mt-1">Monitor and manage platform bookings</p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500 text-sm">No bookings yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const event = booking.event
            const chef = booking.chef
            const client = booking.client
            const commission = (booking.amount * booking.commissionPct) / 100

            return (
              <Card key={booking.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-stone-900 text-sm">{event?.title}</h3>
                        {statusBadge(booking.bookingStatus)}
                        {statusBadge(booking.paymentStatus)}
                      </div>
                      <p className="text-xs text-stone-500">
                        Chef: {chef?.firstName} {chef?.lastName} · Client: {client?.name}
                      </p>
                      <p className="text-xs text-stone-500">{formatDate(event?.date?.toISOString())}</p>
                      <div className="text-sm">
                        <span className="font-semibold text-stone-900">{formatCurrency(booking.amount)}</span>
                        <span className="text-stone-400 text-xs ml-2">
                          Commission: {formatCurrency(commission)} · Net to chef: {formatCurrency(booking.amount - commission)}
                        </span>
                      </div>
                    </div>
                    {booking.bookingStatus === 'disputed' && (
                      <AdminBookingActions bookingId={booking.id} />
                    )}
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
