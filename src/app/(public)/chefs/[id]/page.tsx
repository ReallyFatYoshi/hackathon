import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChefHat, Star, MapPin, Calendar, Award } from 'lucide-react'

export default async function ChefProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: chef } = await supabase
    .from('chefs')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .single()

  if (!chef) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, created_at')
    .eq('chef_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm mb-6">
          <div className="h-48 bg-gradient-to-br from-stone-700 to-stone-900 relative">
            {chef.portfolio_images?.[0] && (
              <img src={chef.portfolio_images[0]} alt="" className="w-full h-full object-cover opacity-40" />
            )}
          </div>
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 mb-6">
              <div className="w-24 h-24 rounded-2xl border-4 border-white bg-amber-100 flex items-center justify-center shadow-lg">
                {chef.portfolio_images?.[0] ? (
                  <img src={chef.portfolio_images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <ChefHat className="h-12 w-12 text-amber-600" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold text-stone-900">{chef.first_name} {chef.last_name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-stone-500">
                  <span className="flex items-center gap-1"><Award className="h-4 w-4" />{chef.years_experience} years experience</span>
                  {chef.avg_rating > 0 && (
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                      {Number(chef.avg_rating).toFixed(1)} ({reviews?.length || 0} reviews)
                    </span>
                  )}
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{chef.total_events} events completed</span>
                </div>
              </div>
              <Link href="/register">
                <Button>Book This Chef</Button>
              </Link>
            </div>

            <p className="text-stone-600 leading-relaxed mb-6">{chef.bio}</p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Cuisine Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {chef.cuisine_specialties?.map((c: string) => (
                    <span key={c} className="bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full border border-amber-100">{c}</span>
                  ))}
                </div>
              </div>
              {chef.event_specialties?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Event Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {chef.event_specialties?.map((e: string) => (
                      <span key={e} className="bg-stone-100 text-stone-700 text-xs px-3 py-1 rounded-full">{e}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Social links */}
            {chef.social_links && Object.keys(chef.social_links).length > 0 && (
              <div className="mt-5 flex gap-3">
                {Object.entries(chef.social_links as Record<string, string>).map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noreferrer"
                    className="text-xs font-medium text-amber-600 hover:underline capitalize">
                    {k}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Portfolio */}
        {chef.portfolio_images?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Portfolio</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {chef.portfolio_images.map((url: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-stone-900 mb-4">Client Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div key={i} className="bg-white rounded-xl border border-stone-200 p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-amber-400 stroke-amber-400' : 'fill-stone-100 stroke-stone-200'}`} />
                    ))}
                  </div>
                  <p className="text-stone-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-stone-500 mb-4">Ready to book {chef.first_name}?</p>
          <Link href="/dashboard/client/events/new">
            <Button size="lg">Post Your Event & Get Proposals</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
