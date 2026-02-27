import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Calendar, ChefHat, BookOpen, Plus } from 'lucide-react'

export default async function ClientOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [eventsRes, bookingsRes] = await Promise.all([
    supabase.from('events').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('bookings').select('*, events(*), chefs(first_name, last_name)').eq('client_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  const events = eventsRes.data || []
  const bookings = bookingsRes.data || []

  const openEvents = events.filter((e) => e.status === 'open').length
  const activeBookings = bookings.filter((b) => b.booking_status === 'confirmed').length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Client Dashboard</h1>
          <p className="text-stone-500 mt-1">Manage your events and bookings</p>
        </div>
        <Link href="/dashboard/client/events/new">
          <Button>
            <Plus className="h-4 w-4" />
            Post Event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{events.length}</p>
                <p className="text-sm text-stone-500">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{openEvents}</p>
                <p className="text-sm text-stone-500">Open Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{activeBookings}</p>
                <p className="text-sm text-stone-500">Active Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Events</CardTitle>
              <Link href="/dashboard/client/events" className="text-xs text-amber-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No events yet</p>
                <Link href="/dashboard/client/events/new">
                  <Button size="sm" className="mt-3">Post your first event</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Link key={event.id} href={`/dashboard/client/events/${event.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-colors">
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900 truncate text-sm">{event.title}</p>
                        <p className="text-xs text-stone-500">{formatDate(event.date)}</p>
                      </div>
                      {statusBadge(event.status)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Link href="/dashboard/client/bookings" className="text-xs text-amber-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Link key={booking.id} href={`/dashboard/client/bookings/${booking.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-colors">
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900 truncate text-sm">
                          {(booking.chefs as any)?.first_name} {(booking.chefs as any)?.last_name}
                        </p>
                        <p className="text-xs text-stone-500">{formatCurrency(booking.amount)}</p>
                      </div>
                      {statusBadge(booking.booking_status)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
