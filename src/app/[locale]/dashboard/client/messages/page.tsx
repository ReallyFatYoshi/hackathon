import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { MessagesView, type Conversation } from '@/components/chat/messages-view'

export default async function ClientMessagesPage() {
  const { user } = await requireAuth()

  const bookings = await db.booking.findMany({
    where: { clientId: user.id, bookingStatus: { in: ['confirmed', 'completed'] } },
    orderBy: { createdAt: 'desc' },
    include: {
      event: { select: { title: true, date: true } },
      chef: { select: { firstName: true, lastName: true, portfolioImages: true } },
    },
  })

  const conversations: Conversation[] = await Promise.all(
    bookings.map(async (booking) => {
      const lastMsg = await db.message.findFirst({
        where: { bookingId: booking.id },
        orderBy: { createdAt: 'desc' },
        select: { content: true, createdAt: true, senderId: true },
      })

      const chef = booking.chef
      const name = `${chef?.firstName ?? ''} ${chef?.lastName ?? ''}`.trim()
      return {
        bookingId: booking.id,
        otherName: name,
        otherImage: chef?.portfolioImages?.[0] ?? null,
        otherInitial: name[0] ?? '?',
        eventTitle: booking.event?.title ?? '',
        eventDate: booking.event?.date?.toISOString() ?? '',
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.createdAt?.toISOString() ?? null,
        isFromMe: lastMsg?.senderId === user.id,
        status: booking.bookingStatus,
      }
    })
  )

  return (
    <MessagesView
      conversations={conversations}
      currentUserId={user.id}
      role="client"
    />
  )
}
