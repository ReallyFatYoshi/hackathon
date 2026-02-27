import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendInterviewScheduledEmail, sendApplicationStatusEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { action, scheduled_at, notes } = body

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: application } = await supabase
    .from('chef_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  const adminClient = await createAdminClient()

  switch (action) {
    case 'schedule_interview': {
      if (!scheduled_at) return NextResponse.json({ error: 'scheduled_at is required' }, { status: 400 })

      // Create Daily.co room
      let dailyRoomUrl = `https://mychef.daily.co/interview-${id.slice(0, 8)}`
      let dailyRoomName = `interview-${id.slice(0, 8)}`

      if (process.env.DAILY_API_KEY) {
        try {
          const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: `interview-${id.slice(0, 8)}-${Date.now()}`,
              properties: {
                enable_prejoin_ui: true,
                enable_chat: true,
                exp: Math.floor(new Date(scheduled_at).getTime() / 1000) + 7200, // +2h
              },
            }),
          })
          if (dailyRes.ok) {
            const dailyData = await dailyRes.json()
            dailyRoomUrl = dailyData.url
            dailyRoomName = dailyData.name
          }
        } catch (e) {
          console.error('Daily.co room creation failed:', e)
        }
      }

      // Create interview record
      const { error: ivError } = await adminClient.from('interviews').insert({
        application_id: id,
        scheduled_at,
        daily_room_url: dailyRoomUrl,
        daily_room_name: dailyRoomName,
        status: 'scheduled',
      })

      if (ivError) return NextResponse.json({ error: ivError.message }, { status: 500 })

      // Update application status
      await adminClient.from('chef_applications').update({ status: 'interview_scheduled' }).eq('id', id)

      // Send email notification
      try {
        await sendInterviewScheduledEmail(
          application.email,
          `${application.first_name} ${application.last_name}`,
          scheduled_at,
          dailyRoomUrl
        )
      } catch (e) {
        console.error('Email send failed:', e)
      }

      return NextResponse.json({ message: 'Interview scheduled and chef notified' })
    }

    case 'approve': {
      // Update application
      await adminClient.from('chef_applications').update({ status: 'approved' }).eq('id', id)

      // Update user role to chef
      await adminClient.from('profiles').update({ role: 'chef' }).eq('id', application.user_id)

      // Create chef profile
      const { error: chefError } = await adminClient.from('chefs').upsert({
        user_id: application.user_id,
        application_id: id,
        first_name: application.first_name,
        last_name: application.last_name,
        bio: application.bio,
        years_experience: application.years_experience,
        cuisine_specialties: application.cuisine_specialties,
        event_specialties: application.event_specialties,
        portfolio_images: application.portfolio_images,
        social_links: application.social_links,
        is_visible: true,
      }, { onConflict: 'user_id' })

      if (chefError) return NextResponse.json({ error: chefError.message }, { status: 500 })

      // Mark interview as completed
      await adminClient.from('interviews').update({ status: 'completed' }).eq('application_id', id)

      // Send email
      try {
        await sendApplicationStatusEmail(application.email, application.first_name, 'approved')
      } catch (e) {
        console.error('Email send failed:', e)
      }

      return NextResponse.json({ message: 'Chef approved and profile activated' })
    }

    case 'reject': {
      await adminClient.from('chef_applications').update({ status: 'rejected' }).eq('id', id)
      try {
        await sendApplicationStatusEmail(application.email, application.first_name, 'rejected')
      } catch (e) { console.error(e) }
      return NextResponse.json({ message: 'Application rejected' })
    }

    case 'no_show': {
      await adminClient.from('chef_applications').update({ status: 'no_show' }).eq('id', id)
      await adminClient.from('interviews').update({ status: 'no_show' }).eq('application_id', id)
      return NextResponse.json({ message: 'Marked as no-show' })
    }

    case 'save_notes': {
      await adminClient.from('chef_applications').update({ admin_notes: notes }).eq('id', id)
      return NextResponse.json({ message: 'Notes saved' })
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
}
