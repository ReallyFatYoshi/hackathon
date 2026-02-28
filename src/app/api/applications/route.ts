import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    applicant_type, company_name, first_name, last_name, email, phone,
    years_experience, cuisine_specialties, event_specialties, bio,
    portfolio_images, social_links,
  } = body

  // Update user role to chef
  await db.user.update({
    where: { id: session.user.id },
    data: { role: 'chef' },
  })

  const application = await db.chefApplication.create({
    data: {
      userId: session.user.id,
      status: 'pending_review',
      applicantType: applicant_type || 'individual',
      companyName: company_name,
      firstName: first_name,
      lastName: last_name,
      email,
      phone,
      yearsExperience: years_experience,
      cuisineSpecialties: cuisine_specialties || [],
      eventSpecialties: event_specialties || [],
      bio,
      portfolioImages: portfolio_images || [],
      socialLinks: social_links || {},
    },
  })

  return NextResponse.json({ id: application.id })
}
