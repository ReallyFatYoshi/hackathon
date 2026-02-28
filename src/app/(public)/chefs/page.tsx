import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChefHat, Building2, Star, Award } from 'lucide-react'

export default async function ChefsPage() {
  const supabase = await createClient()

  const { data: chefs } = await supabase
    .from('chefs')
    .select('id, first_name, last_name, company_name, applicant_type, bio, years_experience, cuisine_specialties, event_specialties, portfolio_images, avg_rating, total_events')
    .eq('is_visible', true)
    .order('avg_rating', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--canvas)' }}>
      {/* Page header */}
      <div className="py-16 md:py-20" style={{ background: 'var(--parchment)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="w-10 h-px mt-5 shrink-0" style={{ background: 'var(--gold)' }} />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: 'var(--gold)' }}>Our Network</p>
              <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-light leading-tight" style={{ color: 'var(--ink)' }}>
                Verified Chefs<br /><span className="italic">& Caterers</span>
              </h1>
              <p className="mt-4 text-base max-w-md leading-relaxed" style={{ color: 'var(--warm-stone)' }}>
                Every chef and catering company on MyChef has been personally reviewed, interviewed, and approved by our team.
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
            <p className="font-display text-2xl font-light mb-2" style={{ color: 'var(--ink)' }}>No verified chefs yet</p>
            <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>Check back soon — we are reviewing applications now.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {chefs.map((chef) => (
              <Link key={chef.id} href={`/chefs/${chef.id}`} className="group">
                <div className="h-full bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1" style={{ borderColor: 'var(--border)' }}>
                  <div className="aspect-[4/3] relative overflow-hidden" style={{ background: 'var(--parchment)' }}>
                    {chef.portfolio_images?.[0] ? (
                      <img
                        src={chef.portfolio_images[0]}
                        alt={`${chef.first_name} portfolio`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-12 w-12" style={{ color: 'var(--muted)' }} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm" style={{ background: chef.applicant_type === 'company' ? 'rgba(12,9,7,0.85)' : 'rgba(200,137,42,0.9)', color: '#fff' }}>
                      {chef.applicant_type === 'company' ? <><Building2 className="h-3 w-3" /> Company</> : <><ChefHat className="h-3 w-3" /> Chef</>}
                    </div>
                    {chef.avg_rating > 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--gold)' }}>
                        <Star className="h-3 w-3 fill-[#C8892A] stroke-[#C8892A]" />
                        {Number(chef.avg_rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold leading-tight mb-1 transition-colors group-hover:text-[#C8892A]" style={{ color: 'var(--ink)' }}>
                      {chef.applicant_type === 'company' && chef.company_name ? chef.company_name : `${chef.first_name} ${chef.last_name}`}
                    </h3>
                    {chef.applicant_type === 'company' && chef.company_name && (
                      <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Contact: {chef.first_name} {chef.last_name}</p>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--warm-stone)' }}>
                        <Award className="h-3 w-3" />{chef.years_experience} yrs
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>·</span>
                      <span className="text-xs" style={{ color: 'var(--warm-stone)' }}>{chef.total_events} events</span>
                    </div>
                    <p className="text-xs mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--warm-stone)' }}>{chef.bio}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {chef.cuisine_specialties?.slice(0, 3).map((c: string) => (
                        <span key={c} className="text-xs px-2.5 py-0.5 rounded-full border" style={{ background: '#C8892A08', color: 'var(--gold)', borderColor: '#C8892A25' }}>{c}</span>
                      ))}
                      {(chef.cuisine_specialties?.length || 0) > 3 && (
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>+{chef.cuisine_specialties.length - 3}</span>
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
