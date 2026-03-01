import { db } from '@/lib/db'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ChefHat, Building2, Star, Award } from 'lucide-react'

export default async function ChefsPage() {
  const t = await getTranslations('chefs')
  const tCommon = await getTranslations('common')
  const chefs = await db.chef.findMany({
    where: { isVisible: true },
    select: { id: true, firstName: true, lastName: true, companyName: true, applicantType: true, bio: true, yearsExperience: true, cuisineSpecialties: true, eventSpecialties: true, portfolioImages: true, avgRating: true, totalEvents: true },
    orderBy: { avgRating: 'desc' },
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--canvas)' }}>
      {/* Page header */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!chefs || chefs.length === 0 ? (
          <div className="text-center py-28">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--parchment)' }}>
              <ChefHat className="h-10 w-10" style={{ color: 'var(--muted)' }} />
            </div>
            <p className="font-display text-2xl font-light mb-2" style={{ color: 'var(--ink)' }}>{t('empty')}</p>
            <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('emptyDesc')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {chefs.map((chef) => (
              <Link key={chef.id} href={`/chefs/${chef.id}`} className="group">
                <div className="h-full bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1" style={{ borderColor: 'var(--border)' }}>
                  <div className="aspect-[4/3] relative overflow-hidden" style={{ background: 'var(--parchment)' }}>
                    {chef.portfolioImages?.[0] ? (
                      <img
                        src={chef.portfolioImages[0]}
                        alt={`${chef.firstName} portfolio`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-12 w-12" style={{ color: 'var(--muted)' }} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm" style={{ background: chef.applicantType === 'company' ? 'rgba(12,9,7,0.85)' : 'rgba(200,137,42,0.9)', color: '#fff' }}>
                      {chef.applicantType === 'company' ? <><Building2 className="h-3 w-3" /> {tCommon('company')}</> : <><ChefHat className="h-3 w-3" /> {tCommon('chef')}</>}
                    </div>
                    {chef.avgRating > 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--gold)' }}>
                        <Star className="h-3 w-3 fill-[#C8892A] stroke-[#C8892A]" />
                        {Number(chef.avgRating).toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold leading-tight mb-1 transition-colors group-hover:text-[#C8892A]" style={{ color: 'var(--ink)' }}>
                      {chef.applicantType === 'company' && chef.companyName ? chef.companyName : `${chef.firstName} ${chef.lastName}`}
                    </h3>
                    {chef.applicantType === 'company' && chef.companyName && (
                      <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Contact: {chef.firstName} {chef.lastName}</p>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--warm-stone)' }}>
                        <Award className="h-3 w-3" />{chef.yearsExperience} {tCommon('yrs')}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>·</span>
                      <span className="text-xs" style={{ color: 'var(--warm-stone)' }}>{chef.totalEvents} {tCommon('events')}</span>
                    </div>
                    <p className="text-xs mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--warm-stone)' }}>{chef.bio}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {chef.cuisineSpecialties?.slice(0, 3).map((c: string) => (
                        <span key={c} className="text-xs px-2.5 py-0.5 rounded-full border" style={{ background: '#C8892A08', color: 'var(--gold)', borderColor: '#C8892A25' }}>{c}</span>
                      ))}
                      {(chef.cuisineSpecialties?.length || 0) > 3 && (
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>{t('more')}{chef.cuisineSpecialties!.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
