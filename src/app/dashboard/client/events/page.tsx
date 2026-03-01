import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency, EVENT_TYPE_OPTIONS } from '@/lib/utils'
import { Plus, Calendar } from 'lucide-react'

export default async function ClientEventsPage() {
  const { user } = await requireAuth()
  const t = await getTranslations('clientEvents')
  const tCommon = await getTranslations('common')
  const tBadges = await getTranslations('badges')

  const events = await db.event.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { eventApplications: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
          <p className="text-stone-500 mt-1">{t('subtitle')}</p>
        </div>
        <Link href="/dashboard/client/events/new">
          <Button><Plus className="h-4 w-4" />{tCommon('postEvent')}</Button>
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-stone-300" />
            <h3 className="font-semibold text-stone-700 mb-2">{t('empty')}</h3>
            <p className="text-stone-500 text-sm mb-5">{t('emptyDesc')}</p>
            <Link href="/dashboard/client/events/new"><Button>{t('postAnEvent')}</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Link key={event.id} href={`/dashboard/client/events/${event.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-stone-900">{event.title}</h3>
                        {statusBadge(event.status, tBadges)}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                        <span>{event.eventType}</span>
                        <span>{formatDate(event.date.toISOString())}</span>
                        <span>{event.location}</span>
                        <span>{event.guestCount} {tCommon('guests')}</span>
                        <span>{formatCurrency(event.budgetMin)} – {formatCurrency(event.budgetMax)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-stone-900">
                        {event._count.eventApplications} {t('applications')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
