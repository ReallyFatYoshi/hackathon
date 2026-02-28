import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ChefHat, Calendar, Clock, BookOpen, Video, Star } from 'lucide-react'

export default async function ChefOverviewPage() {
  const { user } = await requireAuth()

  // Get chef application
  const application = await db.chefApplication.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  // Get interview if scheduled
  let interview = null
  if (application) {
    interview = await db.interview.findFirst({
      where: { applicationId: application.id },
      orderBy: { createdAt: 'desc' },
    })
  }

  // Get chef profile if approved
  const chef = await db.chef.findUnique({ where: { userId: user.id } })

  // Get recent bookings
  let bookings: any[] = []
  if (chef) {
    bookings = await db.booking.findMany({
      where: { chefId: chef.id },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
  }

  const isApproved = application?.status === 'approved'
  const isPending = application?.status === 'pending_review'
  const isInterviewScheduled = application?.status === 'interview_scheduled'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>Chef Dashboard</h1>
        <p className="mt-1" style={{ color: 'var(--warm-stone)' }}>Your culinary career hub</p>
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
                  {formatDateTime(interview.scheduledAt.toISOString())}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">Log in at the scheduled time and click Join Interview.</p>
              </div>
              <a href={interview.dailyRoomUrl} target="_blank" rel="noreferrer">
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
              {application.adminNotes && ` Note: ${application.adminNotes}`}
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
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)' }}>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ background: '#C8892A10' }}>
                <Calendar className="h-5 w-5" style={{ color: '#C8892A' }} />
              </div>
              <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{chef.totalEvents}</p>
              <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>Events Completed</p>
            </div>
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)' }}>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ background: '#EEF2FF' }}>
                <Star className="h-5 w-5" style={{ color: '#4F46E5' }} />
              </div>
              <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{Number(chef.avgRating).toFixed(1)}</p>
              <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>Average Rating</p>
            </div>
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)' }}>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ background: '#ECFDF5' }}>
                <BookOpen className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>
                {bookings.filter((b) => b.bookingStatus === 'confirmed').length}
              </p>
              <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>Active Bookings</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Bookings</CardTitle>
                  <Link href="/dashboard/chef/bookings" className="text-xs hover:underline" style={{ color: 'var(--gold)' }}>View all</Link>
                </div>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8" style={{ color: 'var(--muted)' }}>
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No bookings yet</p>
                    <Link href="/dashboard/chef/events">
                      <Button size="sm" className="mt-3">Browse Events</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--parchment)' }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{b.event?.title}</p>
                          <p className="text-xs" style={{ color: 'var(--warm-stone)' }}>{formatDate(b.event?.date?.toISOString())}</p>
                        </div>
                        {statusBadge(b.bookingStatus)}
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
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 border transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <Calendar className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Browse Open Events</p>
                      <p className="text-xs" style={{ color: 'var(--warm-stone)' }}>Find events to apply for</p>
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard/chef/profile" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 border transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <ChefHat className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Update Profile</p>
                      <p className="text-xs" style={{ color: 'var(--warm-stone)' }}>Keep your profile fresh</p>
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
