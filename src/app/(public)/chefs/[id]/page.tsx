import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChefHat, Star, Calendar, Award, ExternalLink, ArrowRight } from 'lucide-react'

export default async function ChefProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const chef = await db.chef.findFirst({ where: { id, isVisible: true } })
  if (!chef) notFound()

  const reviews = await db.review.findMany({
    where: { chefId: id },
    select: { rating: true, comment: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const displayName = chef.applicantType === 'company' && chef.companyName ? chef.companyName : `${chef.firstName} ${chef.lastName}`

  return (
    <div className="min-h-screen" style={{ background: 'var(--canvas)' }}>
      <div className="relative h-72 md:h-96 overflow-hidden" style={{ background: 'var(--ink)' }}>
        {chef.portfolioImages?.[0] && <img src={chef.portfolioImages[0]} alt="" className="w-full h-full object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--gold)' }}>{chef.applicantType === 'company' ? 'Catering Company' : 'Professional Chef'}</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-tight">{displayName}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-x border-b rounded-b-2xl p-6 md:p-8 mb-8 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'var(--parchment)', borderColor: 'var(--border)' }}>
              {chef.portfolioImages?.[0] ? <img src={chef.portfolioImages[0]} alt="" className="w-full h-full object-cover" /> : <ChefHat className="h-10 w-10" style={{ color: 'var(--muted)' }} />}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 text-sm mb-3" style={{ color: 'var(--warm-stone)' }}>
                <span className="flex items-center gap-1.5"><Award className="h-4 w-4" style={{ color: 'var(--gold)' }} />{chef.yearsExperience} years experience</span>
                {chef.avgRating > 0 && <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--gold)' }}><Star className="h-4 w-4 fill-[#C8892A] stroke-[#C8892A]" />{Number(chef.avgRating).toFixed(1)}<span className="font-normal" style={{ color: 'var(--warm-stone)' }}>({reviews?.length || 0} reviews)</span></span>}
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" style={{ color: 'var(--gold)' }} />{chef.totalEvents} events</span>
              </div>
              {chef.socialLinks && Object.keys(chef.socialLinks).length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {Object.entries(chef.socialLinks as Record<string, string>).map(([k, v]) => (
                    <a key={k} href={v} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium capitalize transition-colors hover:text-[#C8892A]" style={{ color: 'var(--warm-stone)' }}><ExternalLink className="h-3 w-3" />{k}</a>
                  ))}
                </div>
              )}
            </div>
            <Link href="/register"><Button className="bg-[#0C0907] hover:bg-[#1A1208] text-white border-0 shrink-0">Book This Chef <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pb-20">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--ink)' }}>About</h2>
              <p className="leading-relaxed" style={{ color: 'var(--warm-stone)' }}>{chef.bio}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--muted)' }}>Cuisine Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {chef.cuisineSpecialties?.map((c: string) => <span key={c} className="text-xs px-3 py-1 rounded-full border" style={{ background: '#C8892A08', color: 'var(--gold)', borderColor: '#C8892A25' }}>{c}</span>)}
                </div>
              </div>
              {chef.eventSpecialties?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--muted)' }}>Event Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {chef.eventSpecialties?.map((e: string) => <span key={e} className="text-xs px-3 py-1 rounded-full border" style={{ background: 'var(--parchment)', color: 'var(--warm-stone)', borderColor: 'var(--border)' }}>{e}</span>)}
                  </div>
                </div>
              )}
            </div>
            {chef.portfolioImages?.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--ink)' }}>Portfolio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {chef.portfolioImages.map((url: string, i: number) => <div key={i} className="aspect-square rounded-xl overflow-hidden" style={{ background: 'var(--parchment)' }}><img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" /></div>)}
                </div>
              </div>
            )}
            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-5" style={{ color: 'var(--ink)' }}>Client Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review, i) => (
                    <div key={i} className="rounded-xl border p-5 bg-white" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-1 mb-3">{[1,2,3,4,5].map((s) => <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-[#C8892A] stroke-[#C8892A]' : 'fill-stone-100 stroke-stone-200'}`} />)}</div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--warm-stone)' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="md:col-span-1">
            <div className="sticky top-24 rounded-2xl border p-6" style={{ background: 'var(--ink)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="font-display text-2xl font-light text-white mb-1">Ready to book<br /><span style={{ color: 'var(--gold-light)' }}>{chef.firstName}?</span></p>
              <p className="text-xs mt-2 mb-6 leading-relaxed" style={{ color: 'var(--muted)' }}>Post your event and receive a proposal directly from {chef.firstName}.</p>
              <Link href="/dashboard/client/events/new" className="block"><Button className="w-full bg-[#C8892A] hover:bg-[#A0621A] text-white border-0">Post Your Event <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/register" className="block mt-3"><Button variant="ghost" className="w-full border border-white/40 text-white bg-transparent hover:bg-white/10 hover:border-white/60">Create Account First</Button></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}