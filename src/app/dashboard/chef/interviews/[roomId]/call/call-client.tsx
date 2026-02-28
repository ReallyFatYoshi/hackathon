'use client'

import { InterviewCall } from '@/components/chat/interview-call'

export function InterviewCallClient({ roomId, currentUserId, participantName }: {
  roomId: string
  currentUserId: string
  participantName: string
}) {
  return <InterviewCall roomId={roomId} currentUserId={currentUserId} participantName={participantName} />
}
