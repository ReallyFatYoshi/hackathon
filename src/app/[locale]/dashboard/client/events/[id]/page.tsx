import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { SelectChefButton } from './select-chef-button'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await requireAuth()
  const t = await getTranslations('clientEventDetail')
  const tCommon = await getTranslations('common')
  const tBadges = await getTranslations('badges')

  const event = await db.event.findFirst({
    where: { id, clientId: user.id },
  })

  if (!event) notFound()

  const applications = await db.eventApplication.findMany({
    where: { eventId: id },
    orderBy: { createdAt: 'desc' },
    include: { chef: true },
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-stone-900">{event.title}</h1>
          {statusBadge(event.status, tBadges)}
        </div>
        <p className="text-stone-500 text-sm">
          {event.eventType} · {formatDate(event.date.toISOString())} · {event.location} · {event.guestCount} {tCommon('guests')}
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('title')}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-stone-500">{t('budget')}</span>
              <p className="font-medium">{formatCurrency(event.budgetMin)} – {formatCurrency(event.budgetMax)}</p>
            </div>
            <div>
              <span className="text-stone-500">{t('status')}</span>
              <div className="mt-0.5">{statusBadge(event.status, tBadges)}</div>
            </div>
          </div>
          <div>
            <span className="text-stone-500">{t('description')}</span>
            <p className="mt-1 text-stone-700 leading-relaxed">{event.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('applicationsTitle')} ({applications?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!applications || applications.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <p className="text-sm">{t('noApplications')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const chef = app.chef
                return (
                  <div key={app.id} className="border border-stone-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-stone-900">
                            {chef?.firstName} {chef?.lastName}
                          </p>
                          {statusBadge(app.status, tBadges)}
                        </div>
                        <p className="text-xs text-stone-500 mb-1">
                          {chef?.yearsExperience} {t('yearsExperience')} · ⭐ {Number(chef?.avgRating || 0).toFixed(1)} · {chef?.totalEvents} {t('eventsCompleted')}
                        </p>
                        <p className="text-sm text-stone-600">{app.message}</p>
                        {chef?.cuisineSpecialties?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {chef.cuisineSpecialties.slice(0, 4).map((c: string) => (
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
                          budgetMax={event.budgetMax}
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
