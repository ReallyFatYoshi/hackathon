import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Calendar } from 'lucide-react'

export default async function PublicEventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, event_type, date, location, guest_count, budget_min, budget_max, description')
    .eq('status', 'open')
    .order('date', { ascending: true })

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-stone-900 mb-3">Open Events</h1>
          <p className="text-stone-500 text-lg">
            Clients are looking for professional chefs. Are you the right fit?
          </p>
        </div>

        {!events || events.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No open events right now — check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-stone-900">{event.title}</h3>
                        {statusBadge('open')}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 mb-2">
                        <span>{event.event_type}</span>
                        <span>{formatDate(event.date)}</span>
                        <span>{event.location}</span>
                        <span>{event.guest_count} guests</span>
                      </div>
                      <p className="text-sm font-semibold text-stone-900 mb-1">
                        Budget: {formatCurrency(event.budget_min)} – {formatCurrency(event.budget_max)}
                      </p>
                      <p className="text-sm text-stone-600 line-clamp-2">{event.description}</p>
                    </div>
                    <Link href="/login">
                      <div className="text-xs text-amber-600 font-semibold hover:underline shrink-0">
                        Apply as Chef →
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-10 text-center bg-amber-50 rounded-2xl p-8 border border-amber-100">
          <h3 className="text-xl font-bold text-stone-900 mb-2">Are you a professional chef?</h3>
          <p className="text-stone-500 mb-5">Apply to join our verified network and start getting booked.</p>
          <Link href="/apply">
            <button className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors">
              Apply Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
