import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Calendar, MapPin, Users, ArrowLeft, Star } from 'lucide-react'
import { BookingChatClient } from './chat-client'

export default async function ClientBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await requireAuth()

  const booking = await db.booking.findFirst({
    where: { id, clientId: user.id },
    include: {
      event: true,
      chef: { select: { id: true, firstName: true, lastName: true, userId: true, portfolioImages: true, avgRating: true, cuisineSpecialties: true } },
    },
  })

  if (!booking) notFound()

  const chef = booking.chef
  const event = booking.event
  const chefName = `${chef?.firstName} ${chef?.lastName}`

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/client/bookings"
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
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Total booked</p>
          </div>
        </div>
      </div>

      {/* Chef info + Chat side-by-side */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chef card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border p-5 sticky top-20" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                style={{ background: 'var(--parchment)' }}
              >
                {chef?.portfolioImages?.[0]
                  ? <img src={chef.portfolioImages[0]} alt="" className="w-full h-full object-cover" />
                  : <span className="font-display text-lg font-semibold" style={{ color: 'var(--muted)' }}>{chef?.firstName?.[0]}</span>
                }
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{chefName}</p>
                {chef?.avgRating > 0 && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--gold)' }}>
                    <Star className="h-3 w-3 fill-[#C8892A] stroke-[#C8892A]" />
                    {Number(chef.avgRating).toFixed(1)}
                  </div>
                )}
              </div>
            </div>
            {chef?.cuisineSpecialties && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {chef.cuisineSpecialties.slice(0, 4).map((c: string) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-full border" style={{ background: '#C8892A08', color: 'var(--gold)', borderColor: '#C8892A25' }}>{c}</span>
                ))}
              </div>
            )}
            <Link
              href={`/chefs/${chef?.id}`}
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--gold)' }}
            >
              View full profile →
            </Link>
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 h-[600px]">
          <BookingChatClient
            bookingId={booking.id}
            currentUserId={user.id}
            otherUserName={chefName}
          />
        </div>
      </div>
    </div>
  )
}
