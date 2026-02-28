import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendInterviewScheduledEmail, sendApplicationStatusEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { action, scheduled_at, notes } = body

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const application = await db.chefApplication.findUnique({ where: { id } })
  if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  switch (action) {
    case 'schedule_interview': {
      if (!scheduled_at) return NextResponse.json({ error: 'scheduled_at is required' }, { status: 400 })

      const roomId = `interview-${id.slice(0, 8)}-${Date.now()}`

      // Create interview record
      await db.interview.create({
        data: {
          applicationId: id,
          scheduledAt: new Date(scheduled_at),
          roomId,
          status: 'scheduled',
        },
      })

      // Update application status
      await db.chefApplication.update({ where: { id }, data: { status: 'interview_scheduled' } })

      // Send email notification
      const callUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/admin/interviews/${roomId}/call`
      try {
        await sendInterviewScheduledEmail(
          application.email,
          `${application.firstName} ${application.lastName}`,
          scheduled_at,
          callUrl
        )
      } catch (e) {
        console.error('Email send failed:', e)
      }

      return NextResponse.json({ message: 'Interview scheduled and chef notified' })
    }

    case 'approve': {
      // Update application
      await db.chefApplication.update({ where: { id }, data: { status: 'approved' } })

      // Update user role to chef
      if (application.userId) {
        await db.user.update({ where: { id: application.userId }, data: { role: 'chef' } })
      }

      // Create chef profile
      await db.chef.upsert({
        where: { userId: application.userId! },
        update: {
          applicationId: id,
          applicantType: application.applicantType ?? 'individual',
          companyName: application.companyName ?? null,
          firstName: application.firstName,
          lastName: application.lastName,
          bio: application.bio,
          yearsExperience: application.yearsExperience,
          cuisineSpecialties: application.cuisineSpecialties,
          eventSpecialties: application.eventSpecialties,
          portfolioImages: application.portfolioImages,
          socialLinks: application.socialLinks ?? undefined,
          isVisible: true,
        },
        create: {
          userId: application.userId!,
          applicationId: id,
          applicantType: application.applicantType ?? 'individual',
          companyName: application.companyName ?? null,
          firstName: application.firstName,
          lastName: application.lastName,
          bio: application.bio,
          yearsExperience: application.yearsExperience,
          cuisineSpecialties: application.cuisineSpecialties,
          eventSpecialties: application.eventSpecialties,
          portfolioImages: application.portfolioImages,
          socialLinks: application.socialLinks ?? undefined,
          isVisible: true,
        },
      })

      // Mark interview as completed
      await db.interview.updateMany({ where: { applicationId: id }, data: { status: 'completed' } })

      // Send email
      try {
        await sendApplicationStatusEmail(application.email, application.firstName, 'approved')
      } catch (e) {
        console.error('Email send failed:', e)
      }

      return NextResponse.json({ message: 'Chef approved and profile activated' })
    }

    case 'reject': {
      await db.chefApplication.update({ where: { id }, data: { status: 'rejected' } })
      try {
        await sendApplicationStatusEmail(application.email, application.firstName, 'rejected')
      } catch (e) { console.error(e) }
      return NextResponse.json({ message: 'Application rejected' })
    }

    case 'no_show': {
      await db.chefApplication.update({ where: { id }, data: { status: 'no_show' } })
      await db.interview.updateMany({ where: { applicationId: id }, data: { status: 'no_show' } })
      return NextResponse.json({ message: 'Marked as no-show' })
    }

    case 'save_notes': {
      await db.chefApplication.update({ where: { id }, data: { adminNotes: notes } })
      return NextResponse.json({ message: 'Notes saved' })
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
}
