import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { BookOpen } from 'lucide-react'
import { ConfirmCompletionButton } from './confirm-button'

export default async function ClientBookingsPage() {
  const { user } = await requireAuth()
  const t = await getTranslations('clientBookings')
  const tBadges = await getTranslations('badges')

  const bookings = await db.booking.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { event: true, chef: { select: { firstName: true, lastName: true, avgRating: true } } },
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
            <h3 className="font-semibold text-stone-700 mb-2">{t('empty')}</h3>
            <p className="text-stone-500 text-sm">{t('emptyDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const chef = booking.chef
            const event = booking.event
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
                      <p className="text-sm text-stone-600 mb-1">
                        {t('chef')} <span className="font-medium">{chef?.firstName} {chef?.lastName}</span>
                      </p>
                      <p className="text-sm text-stone-500">{formatDate(event?.date?.toISOString())}</p>
                      <p className="text-sm font-semibold text-stone-900 mt-1">{formatCurrency(booking.amount)}</p>
                      <p className="text-xs text-stone-400">
                        {t('platformCommission')} {booking.commissionPct}{t('deductedOnRelease')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {booking.bookingStatus === 'confirmed' && !booking.clientConfirmedAt && (
                        <ConfirmCompletionButton bookingId={booking.id} />
                      )}
                      {booking.bookingStatus === 'completed' && (
                        <Link href={`/dashboard/client/bookings/${booking.id}/review`}>
                          <button className="text-xs text-amber-600 font-semibold hover:underline">{t('leaveReview')}</button>
                        </Link>
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
