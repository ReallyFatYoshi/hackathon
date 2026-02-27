import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ChefHat, Calendar, Clock, BookOpen, Video } from 'lucide-react'

export default async function ChefOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get chef application
  const { data: application } = await supabase
    .from('chef_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get interview if scheduled
  let interview = null
  if (application) {
    const { data: iv } = await supabase
      .from('interviews')
      .select('*')
      .eq('application_id', application.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    interview = iv
  }

  // Get chef profile if approved
  const { data: chef } = await supabase
    .from('chefs')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get recent bookings
  let bookings: any[] = []
  if (chef) {
    const { data } = await supabase
      .from('bookings')
      .select('*, events(*)')
      .eq('chef_id', chef.id)
      .order('created_at', { ascending: false })
      .limit(5)
    bookings = data || []
  }

  const isApproved = application?.status === 'approved'
  const isPending = application?.status === 'pending_review'
  const isInterviewScheduled = application?.status === 'interview_scheduled'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Chef Dashboard</h1>
        <p className="text-stone-500 mt-1">Your culinary career hub</p>
      </div>

      {/* Application Status Banner */}
      {!application && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-800">No application submitted</p>
              <p className="text-sm text-amber-700">Apply to join our network of verified professional chefs.</p>
            </div>
            <Link href="/apply"><Button>Apply Now</Button></Link>
          </CardContent>
        </Card>
      )}

      {isPending && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-5">
            <div className="flex items-center gap-3 mb-1">
              <Clock className="h-5 w-5 text-amber-600" />
              <p className="font-semibold text-amber-800">Application Under Review</p>
            </div>
            <p className="text-sm text-amber-700">Our team is reviewing your application. We&apos;ll be in touch within 3–5 business days.</p>
          </CardContent>
        </Card>
      )}

      {isInterviewScheduled && interview && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Video className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-blue-800">Interview Scheduled</p>
                </div>
                <p className="text-sm text-blue-700">
                  {formatDateTime(interview.scheduled_at)}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">Log in at the scheduled time and click Join Interview.</p>
              </div>
              <a href={interview.daily_room_url} target="_blank" rel="noreferrer">
                <Button variant="outline" className="border-blue-400 text-blue-700 hover:bg-blue-100">
                  <Video className="h-4 w-4" />
                  Join Interview
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {application?.status === 'rejected' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-5">
            <p className="font-semibold text-red-800">Application Not Approved</p>
            <p className="text-sm text-red-700 mt-0.5">
              Unfortunately your application was not approved. You&apos;re welcome to reapply.
              {application.admin_notes && ` Note: ${application.admin_notes}`}
            </p>
            <Link href="/apply" className="mt-3 inline-block">
              <Button size="sm" variant="outline">Reapply</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {isApproved && chef && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-2xl font-bold text-stone-900">{chef.total_events}</p>
                <p className="text-sm text-stone-500">Events Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-2xl font-bold text-stone-900">⭐ {Number(chef.avg_rating).toFixed(1)}</p>
                <p className="text-sm text-stone-500">Average Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-2xl font-bold text-stone-900">
                  {bookings.filter((b) => b.booking_status === 'confirmed').length}
                </p>
                <p className="text-sm text-stone-500">Active Bookings</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Bookings</CardTitle>
                  <Link href="/dashboard/chef/bookings" className="text-xs text-amber-600 hover:underline">View all</Link>
                </div>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-stone-400">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No bookings yet</p>
                    <Link href="/dashboard/chef/events">
                      <Button size="sm" className="mt-3">Browse Events</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-50">
                        <div>
                          <p className="text-sm font-medium text-stone-900">{(b.events as any)?.title}</p>
                          <p className="text-xs text-stone-500">{formatDate((b.events as any)?.date)}</p>
                        </div>
                        {statusBadge(b.booking_status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/chef/events" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 border border-stone-200 transition-colors">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-stone-900">Browse Open Events</p>
                      <p className="text-xs text-stone-500">Find events to apply for</p>
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard/chef/profile" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 border border-stone-200 transition-colors">
                    <ChefHat className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-stone-900">Update Profile</p>
                      <p className="text-xs text-stone-500">Keep your profile fresh</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
