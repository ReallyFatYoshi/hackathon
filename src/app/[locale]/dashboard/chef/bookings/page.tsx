import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { BookOpen } from 'lucide-react'
import { MarkCompleteButton } from './mark-complete-button'

export default async function ChefBookingsPage() {
  const { user } = await requireAuth()
  const t = await getTranslations('chefBookings')
  const tBadges = await getTranslations('badges')

  const chef = await db.chef.findUnique({ where: { userId: user.id }, select: { id: true } })
  if (!chef) redirect('/dashboard/chef')

  const bookings = await db.booking.findMany({
    where: { chefId: chef.id },
    include: { event: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
        <p className="text-stone-500 mt-1">{t('subtitle')}</p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500 text-sm">{t('empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const event = booking.event
            const commission = (booking.amount * booking.commissionPct) / 100
            const netAmount = booking.amount - commission

            return (
              <Card key={booking.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-stone-900">{event?.title}</h3>
                        {statusBadge(booking.bookingStatus, tBadges)}
                        {statusBadge(booking.paymentStatus, tBadges)}
                      </div>
                      <p className="text-sm text-stone-500">{formatDate(event?.date?.toISOString())}</p>
                      <p className="text-sm text-stone-500">{event?.location}</p>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-sm font-semibold text-stone-900">
                          {t('total')} {formatCurrency(booking.amount)}
                        </p>
                        <p className="text-xs text-stone-400">
                          {t('platformFee')} ({booking.commissionPct}%): −{formatCurrency(commission)}
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          {t('youReceive')} {formatCurrency(netAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {booking.bookingStatus === 'confirmed' && !booking.chefCompletedAt && (
                        <MarkCompleteButton bookingId={booking.id} />
                      )}
                      {booking.chefCompletedAt && !booking.clientConfirmedAt && (
                        <div className="text-xs text-stone-500 text-right">
                          {t('awaitingClient')}<br/>{t('confirmation')}
                        </div>
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
