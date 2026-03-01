'use client'

import { ChatRoom } from '@/components/chat/chat-room'

interface Props {
  bookingId: string
  currentUserId: string
  otherUserName: string
}

export function BookingChatClient({ bookingId, currentUserId, otherUserName }: Props) {
  return (
    <ChatRoom
      bookingId={bookingId}
      currentUserId={currentUserId}
      otherUserName={otherUserName}
    />
  )
}
