import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Calendar } from 'lucide-react'
import { ApplyToEventButton } from './apply-button'

export default async function ChefEventsPage() {
  const { user } = await requireAuth()

  // Check if approved chef
  const chef = await db.chef.findUnique({ where: { userId: user.id }, select: { id: true } })
  if (!chef) redirect('/dashboard/chef')

  // Get open events
  const events = await db.event.findMany({
    where: { status: 'open' },
    orderBy: { date: 'asc' },
  })

  // Get chef's existing applications
  const myApplications = await db.eventApplication.findMany({
    where: { chefId: chef.id },
    select: { eventId: true, status: true },
  })

  const appliedEventIds = new Set(myApplications.map((a) => a.eventId))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Open Events</h1>
        <p className="text-stone-500 mt-1">Browse and apply to events that match your expertise</p>
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500 text-sm">No open events at the moment. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const hasApplied = appliedEventIds.has(event.id)
            const myApp = myApplications.find((a) => a.eventId === event.id)
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-stone-900">{event.title}</h3>
                        {statusBadge(event.status)}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 mb-2">
                        <span>{event.eventType}</span>
                        <span>{formatDate(event.date.toISOString())}</span>
                        <span>{event.location}</span>
                        <span>{event.guestCount} guests</span>
                      </div>
                      <p className="text-sm font-semibold text-stone-900 mb-1">
                        Budget: {formatCurrency(event.budgetMin)} – {formatCurrency(event.budgetMax)}
                      </p>
                      <p className="text-sm text-stone-600 line-clamp-2">{event.description}</p>
                    </div>
                    <div className="shrink-0">
                      {hasApplied ? (
                        <div className="text-right">
                          {statusBadge(myApp?.status || 'pending')}
                          <p className="text-xs text-stone-400 mt-1">Applied</p>
                        </div>
                      ) : (
                        <ApplyToEventButton eventId={event.id} chefId={chef.id} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
