import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { MessagesView, type Conversation } from '@/components/chat/messages-view'

export default async function ChefMessagesPage() {
  const { user } = await requireAuth()

  const chef = await db.chef.findUnique({ where: { userId: user.id }, select: { id: true } })
  if (!chef) redirect('/dashboard/chef')

  const bookings = await db.booking.findMany({
    where: {
      chefId: chef.id,
      bookingStatus: { in: ['confirmed', 'completed'] },
    },
    include: {
      event: { select: { title: true, date: true } },
      client: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const conversations: Conversation[] = await Promise.all(
    bookings.map(async (booking) => {
      const lastMsg = await db.message.findFirst({
        where: { bookingId: booking.id },
        orderBy: { createdAt: 'desc' },
        select: { content: true, createdAt: true, senderId: true },
      })

      const name = booking.client.name || 'Client'
      return {
        bookingId: booking.id,
        otherName: name,
        otherImage: booking.client.image ?? null,
        otherInitial: name[0] ?? '?',
        eventTitle: booking.event.title,
        eventDate: booking.event.date.toISOString(),
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
      role="chef"
    />
  )
}
