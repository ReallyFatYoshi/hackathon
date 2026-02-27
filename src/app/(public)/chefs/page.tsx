import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ChefHat, Star, Search } from 'lucide-react'

export default async function ChefsPage() {
  const supabase = await createClient()

  const { data: chefs } = await supabase
    .from('chefs')
    .select('id, first_name, last_name, bio, years_experience, cuisine_specialties, event_specialties, portfolio_images, avg_rating, total_events')
    .eq('is_visible', true)
    .order('avg_rating', { ascending: false })

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-stone-900 mb-3">Verified Professional Chefs</h1>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            Every chef on MyChef has been personally reviewed, interviewed, and approved by our team.
          </p>
        </div>

        {/* Grid */}
        {!chefs || chefs.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No verified chefs yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {chefs.map((chef) => (
              <Link key={chef.id} href={`/chefs/${chef.id}`} className="group">
                <Card className="h-full hover:shadow-lg transition-all group-hover:border-amber-200">
                  <div className="aspect-[4/3] bg-stone-100 rounded-t-xl overflow-hidden">
                    {chef.portfolio_images?.[0] ? (
                      <img
                        src={chef.portfolio_images[0]}
                        alt={`${chef.first_name}'s food`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-14 w-14 text-stone-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                        {chef.first_name} {chef.last_name}
                      </h3>
                      {chef.avg_rating > 0 && (
                        <span className="flex items-center gap-1 text-sm text-amber-600 font-semibold">
                          <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                          {Number(chef.avg_rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mb-1">{chef.years_experience} yrs · {chef.total_events} events</p>
                    <p className="text-xs text-stone-600 mb-3 line-clamp-2">{chef.bio}</p>
                    <div className="flex flex-wrap gap-1">
                      {chef.cuisine_specialties?.slice(0, 3).map((c: string) => (
                        <span key={c} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-100">
                          {c}
                        </span>
                      ))}
                      {(chef.cuisine_specialties?.length || 0) > 3 && (
                        <span className="text-xs text-stone-400">+{chef.cuisine_specialties.length - 3}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
