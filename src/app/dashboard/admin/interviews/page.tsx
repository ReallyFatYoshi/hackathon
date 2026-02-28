import { requireRole } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { Video } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminInterviewsPage() {
  await requireRole('admin')

  const interviews = await db.interview.findMany({
    include: { application: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { scheduledAt: 'asc' },
  })

  const upcoming = interviews.filter((i) => i.status === 'scheduled')
  const past = interviews.filter((i) => i.status !== 'scheduled')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Interviews</h1>
        <p className="text-stone-500 mt-1">{upcoming.length} upcoming</p>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((iv) => {
              const app = iv.application
              return (
                <Card key={iv.id} className="border-blue-100 bg-blue-50/30">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-stone-900">
                          {app?.firstName} {app?.lastName}
                        </p>
                        <p className="text-sm text-stone-500">{app?.email}</p>
                        <p className="text-sm text-blue-700 font-medium mt-0.5">{formatDateTime(iv.scheduledAt.toISOString())}</p>
                      </div>
                      <div className="flex gap-2">
                        <a href={iv.dailyRoomUrl} target="_blank" rel="noreferrer">
                          <Button size="sm">
                            <Video className="h-4 w-4" />
                            Join Room
                          </Button>
                        </a>
                        <Link href={`/dashboard/admin/applications/${iv.applicationId}`}>
                          <Button size="sm" variant="outline">Review Application</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-3">Past</h2>
          <div className="space-y-2">
            {past.map((iv) => {
              const app = iv.application
              return (
                <Card key={iv.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{app?.firstName} {app?.lastName}</p>
                        <p className="text-xs text-stone-500">{formatDateTime(iv.scheduledAt.toISOString())}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(iv.status)}
                        <Link href={`/dashboard/admin/applications/${iv.applicationId}`}>
                          <button className="text-xs text-amber-600 hover:underline">View</button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {interviews.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500 text-sm">No interviews yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
