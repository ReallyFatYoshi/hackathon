import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Calendar, ChefHat, BookOpen, Plus, TrendingUp } from 'lucide-react'

export default async function ClientOverviewPage() {
  const { user } = await requireAuth()
  const t = await getTranslations('clientDashboard')
  const tCommon = await getTranslations('common')
  const tBadges = await getTranslations('badges')

  const [events, bookings] = await Promise.all([
    db.event.findMany({ where: { clientId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.booking.findMany({ where: { clientId: user.id }, orderBy: { createdAt: 'desc' }, take: 5, include: { event: true, chef: true } }),
  ])

  const openEvents = events.filter((e) => e.status === 'open').length
  const activeBookings = bookings.filter((b) => b.bookingStatus === 'confirmed').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div data-tour="page-header" className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{t('title')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--warm-stone)' }}>{t('subtitle')}</p>
        </div>
        <Link href="/dashboard/client/events/new">
          <Button data-tour="post-event-btn" className="bg-[#0C0907] hover:bg-[#1A1208] text-white border-0">
            <Plus className="h-4 w-4" />
            {tCommon('postEvent')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div data-tour="stats-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t('totalEvents'),    value: events.length,   icon: Calendar,    color: '#C8892A', bg: '#C8892A10' },
          { label: t('openEvents'),     value: openEvents,      icon: TrendingUp,  color: '#4F46E5', bg: '#EEF2FF' },
          { label: t('activeBookings'), value: activeBookings,  icon: BookOpen,    color: '#059669', bg: '#ECFDF5' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.bg }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--warm-stone)' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div data-tour="recent-section" className="grid md:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card data-tour="recent-events">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>{t('recentEvents')}</CardTitle>
              <Link href="/dashboard/client/events" className="text-xs font-medium hover:underline" style={{ color: 'var(--gold)' }}>{tCommon('viewAll')}</Link>
            </div>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--parchment)' }}>
                  <Calendar className="h-6 w-6" style={{ color: 'var(--muted)' }} />
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--warm-stone)' }}>{t('noEvents')}</p>
                <Link href="/dashboard/client/events/new">
                  <Button size="sm" className="bg-[#0C0907] text-white border-0">{t('postFirst')}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {events.map((event) => (
                  <Link key={event.id} href={`/dashboard/client/events/${event.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-stone-50">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--ink)' }}>{event.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{formatDate(event.date.toISOString())}</p>
                      </div>
                      {statusBadge(event.status, tBadges)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card data-tour="recent-bookings">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>{t('recentBookings')}</CardTitle>
              <Link href="/dashboard/client/bookings" className="text-xs font-medium hover:underline" style={{ color: 'var(--gold)' }}>{tCommon('viewAll')}</Link>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--parchment)' }}>
                  <BookOpen className="h-6 w-6" style={{ color: 'var(--muted)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('noBookings')}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--parchment)' }}>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--ink)' }}>
                        {booking.chef?.firstName} {booking.chef?.lastName}
                      </p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--gold)' }}>{formatCurrency(booking.amount)}</p>
                    </div>
                    {statusBadge(booking.bookingStatus, tBadges)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
