import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { SelectChefButton } from './select-chef-button'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('client_id', user.id)
    .single()

  if (!event) notFound()

  const { data: applications } = await supabase
    .from('event_applications')
    .select('*, chefs(*)')
    .eq('event_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-stone-900">{event.title}</h1>
          {statusBadge(event.status)}
        </div>
        <p className="text-stone-500 text-sm">
          {event.event_type} · {formatDate(event.date)} · {event.location} · {event.guest_count} guests
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-stone-500">Budget</span>
              <p className="font-medium">{formatCurrency(event.budget_min)} – {formatCurrency(event.budget_max)}</p>
            </div>
            <div>
              <span className="text-stone-500">Status</span>
              <div className="mt-0.5">{statusBadge(event.status)}</div>
            </div>
          </div>
          <div>
            <span className="text-stone-500">Description</span>
            <p className="mt-1 text-stone-700 leading-relaxed">{event.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chef Applications ({applications?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!applications || applications.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <p className="text-sm">No applications yet. Chefs will apply soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const chef = app.chefs as any
                return (
                  <div key={app.id} className="border border-stone-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-stone-900">
                            {chef?.first_name} {chef?.last_name}
                          </p>
                          {statusBadge(app.status)}
                        </div>
                        <p className="text-xs text-stone-500 mb-1">
                          {chef?.years_experience} years experience · ⭐ {Number(chef?.avg_rating || 0).toFixed(1)} · {chef?.total_events} events completed
                        </p>
                        <p className="text-sm text-stone-600">{app.message}</p>
                        {chef?.cuisine_specialties?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {chef.cuisine_specialties.slice(0, 4).map((c: string) => (
                              <span key={c} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {event.status === 'open' && app.status === 'pending' && (
                        <SelectChefButton
                          applicationId={app.id}
                          eventId={event.id}
                          chefId={chef?.id}
                          budgetMax={event.budget_max}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
