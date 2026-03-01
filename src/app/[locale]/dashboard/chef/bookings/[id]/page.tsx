import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react'
import { BookingChatClient } from './chat-client'

export default async function ChefBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await requireAuth()

  // Get chef profile for this user
  const chef = await db.chef.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  if (!chef) redirect('/dashboard/chef')

  const booking = await db.booking.findFirst({
    where: { id, chefId: chef.id },
    include: {
      event: true,
      client: { select: { id: true, name: true, image: true } },
    },
  })

  if (!booking) notFound()

  const client = booking.client
  const event = booking.event
  const clientName = client?.name || 'Client'

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/chef/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
        style={{ color: 'var(--warm-stone)' }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      {/* Booking header */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--ink)' }}>{event?.title}</h1>
              {statusBadge(booking.bookingStatus)}
              {statusBadge(booking.paymentStatus)}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm" style={{ color: 'var(--warm-stone)' }}>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />{formatDate(event?.date?.toISOString())}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />{event?.location}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />{event?.guestCount} guests</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-2xl font-semibold" style={{ color: 'var(--ink)' }}>{formatCurrency(booking.amount)}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Booking total</p>
          </div>
        </div>
      </div>

      {/* Client info + Chat */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border p-5 sticky top-20" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                style={{ background: 'var(--parchment)' }}
              >
                {client?.image
                  ? <img src={client.image} alt="" className="w-full h-full object-cover" />
                  : <span className="font-display text-lg font-semibold" style={{ color: 'var(--muted)' }}>{client?.name?.[0] || 'C'}</span>
                }
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{clientName}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Client</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 h-[600px]">
          <BookingChatClient
            bookingId={booking.id}
            currentUserId={user.id}
            otherUserName={clientName}
          />
        </div>
      </div>
    </div>
  )
}
