import { db } from '@/lib/db'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react'

export default async function PublicEventsPage() {
  const t = await getTranslations('events')
  const tCommon = await getTranslations('common')
  const tBadges = await getTranslations('badges')
  const events = await db.event.findMany({
    where: { status: 'open' },
    select: { id: true, title: true, eventType: true, date: true, location: true, guestCount: true, budgetMin: true, budgetMax: true, description: true },
    orderBy: { date: 'asc' },
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--canvas)' }}>
      {/* Header */}
      <div className="py-16 md:py-20" style={{ background: 'var(--parchment)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="w-10 h-px mt-5 shrink-0" style={{ background: 'var(--gold)' }} />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: 'var(--gold)' }}>{t('eyebrow')}</p>
              <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-light leading-tight" style={{ color: 'var(--ink)' }}>
                {t('title')}
              </h1>
              <p className="mt-4 text-base max-w-md leading-relaxed" style={{ color: 'var(--warm-stone)' }}>
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!events || events.length === 0 ? (
          <div className="text-center py-28">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--parchment)' }}>
              <Calendar className="h-10 w-10" style={{ color: 'var(--muted)' }} />
            </div>
            <p className="font-display text-2xl font-light mb-2" style={{ color: 'var(--ink)' }}>{t('empty')}</p>
            <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('emptyDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl border p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                      <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>{event.title}</h3>
                      {statusBadge('open', tBadges)}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs mb-3" style={{ color: 'var(--warm-stone)' }}>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />{formatDate(event.date.toISOString())}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />{event.location}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />{event.guestCount} {tCommon('guests')}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--parchment)', color: 'var(--warm-stone)' }}>{event.eventType}</span>
                    </div>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>
                      {tCommon('budget')}: {formatCurrency(event.budgetMin)} – {formatCurrency(event.budgetMax)}
                    </p>
                    <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--warm-stone)' }}>{event.description}</p>
                  </div>
                  <Link href="/login" className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[#A0621A] shrink-0" style={{ color: 'var(--gold)' }}>
                    {t('applyAsChef')} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chef CTA */}
        <div className="rounded-2xl p-8 border" style={{ background: 'var(--ink)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div>
              <p className="font-display text-2xl font-light text-white mb-1">{t('ctaTitle')}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('ctaDesc')}</p>
            </div>
            <Link href="/apply" className="shrink-0 px-6 py-3 rounded-xl font-semibold text-sm transition-colors bg-[#C8892A] hover:bg-[#A0621A] text-white">
              {tCommon('applyNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
