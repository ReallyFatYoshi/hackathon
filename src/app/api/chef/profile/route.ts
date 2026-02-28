import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helpers'
import { db } from '@/lib/db'

export async function PUT(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bio, cuisineSpecialties, eventSpecialties } = await req.json()

  try {
    const chef = await db.chef.update({
      where: { userId: session.user.id },
      data: { bio, cuisineSpecialties, eventSpecialties },
    })
    return NextResponse.json(chef)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
