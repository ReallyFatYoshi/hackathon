import { requireRole } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { InterviewCallClient } from './call-client'

export default async function AdminInterviewCallPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const { user } = await requireRole('admin')

  const interview = await db.interview.findFirst({
    where: { roomId },
    include: { application: { select: { firstName: true, lastName: true } } },
  })
  if (!interview) notFound()

  const name = `${interview.application.firstName} ${interview.application.lastName}`

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Interview Call</h1>
        <p className="text-stone-500 text-sm">With {name}</p>
      </div>
      <InterviewCallClient roomId={roomId} currentUserId={user.id} participantName={name} />
    </div>
  )
}
