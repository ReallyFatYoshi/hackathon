import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { InterviewCallClient } from './call-client'

export default async function ChefInterviewCallPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const { user } = await requireAuth()

  const interview = await db.interview.findFirst({
    where: { roomId },
    include: { application: { select: { userId: true } } },
  })
  if (!interview || interview.application.userId !== user.id) notFound()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Interview Call</h1>
        <p className="text-stone-500 text-sm">Your scheduled interview</p>
      </div>
      <InterviewCallClient roomId={roomId} currentUserId={user.id} participantName="Interviewer" />
    </div>
  )
}
