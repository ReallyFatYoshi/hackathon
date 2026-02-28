import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { MessageSquare, ChefHat } from 'lucide-react'

export default async function ClientMessagesPage() {
  const { user } = await requireAuth()

  // Get all bookings for this client with chef info
  const bookings = await db.booking.findMany({
    where: { clientId: user.id, bookingStatus: { in: ['confirmed', 'completed'] } },
    orderBy: { createdAt: 'desc' },
    include: {
      event: { select: { title: true, date: true } },
      chef: { select: { firstName: true, lastName: true, portfolioImages: true } },
    },
  })

  // For each booking, get the latest message
  const conversations = await Promise.all(
    bookings.map(async (booking) => {
      const lastMsg = await db.message.findFirst({
        where: { bookingId: booking.id },
        orderBy: { createdAt: 'desc' },
        select: { content: true, createdAt: true, senderId: true },
      })

      const chef = booking.chef
      return {
        bookingId: booking.id,
        chefName: `${chef?.firstName ?? ''} ${chef?.lastName ?? ''}`.trim(),
        chefImage: chef?.portfolioImages?.[0],
        eventTitle: booking.event?.title,
        eventDate: booking.event?.date?.toISOString(),
        lastMessage: lastMsg?.content,
        lastMessageAt: lastMsg?.createdAt?.toISOString(),
        isFromMe: lastMsg?.senderId === user.id,
        status: booking.bookingStatus,
      }
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--ink)' }}>Messages</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Chat with your booked chefs</p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border text-center py-16 px-6" style={{ borderColor: 'var(--border)' }}>
          <MessageSquare className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--muted)' }} />
          <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--ink)' }}>No conversations yet</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Once you book a chef, you can chat with them here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border divide-y overflow-hidden" style={{ borderColor: 'var(--border)', '--tw-divide-color': 'var(--border)' } as React.CSSProperties}>
          {conversations.map((conv) => (
            <Link
              key={conv.bookingId}
              href={`/dashboard/client/bookings/${conv.bookingId}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-stone-50"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'var(--parchment)' }}>
                {conv.chefImage
                  ? <img src={conv.chefImage} alt="" className="w-full h-full object-cover" />
                  : <ChefHat className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                }
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>{conv.chefName}</p>
                  {conv.lastMessageAt && (
                    <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>{formatDate(conv.lastMessageAt)}</span>
                  )}
                </div>
                <p className="text-xs truncate mb-0.5" style={{ color: 'var(--warm-stone)' }}>{conv.eventTitle}</p>
                {conv.lastMessage ? (
                  <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>
                    {conv.isFromMe && <span style={{ color: 'var(--warm-stone)' }}>You: </span>}
                    {conv.lastMessage}
                  </p>
                ) : (
                  <p className="text-sm italic" style={{ color: 'var(--muted)' }}>No messages yet — say hello!</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
