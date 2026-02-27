import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ChefHat, Star } from 'lucide-react'

export default async function ClientChefsPage() {
  const supabase = await createClient()

  const { data: chefs } = await supabase
    .from('chefs')
    .select('*')
    .eq('is_visible', true)
    .order('avg_rating', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Browse Verified Chefs</h1>
        <p className="text-stone-500 mt-1">All chefs are personally vetted and interviewed by our team</p>
      </div>

      {!chefs || chefs.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No verified chefs yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {chefs.map((chef) => (
            <Link key={chef.id} href={`/chefs/${chef.id}`} target="_blank">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="aspect-[4/3] bg-stone-100 rounded-t-xl overflow-hidden">
                  {chef.portfolio_images?.[0] ? (
                    <img src={chef.portfolio_images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="h-12 w-12 text-stone-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-stone-900">{chef.first_name} {chef.last_name}</h3>
                    {chef.avg_rating > 0 && (
                      <span className="flex items-center gap-1 text-sm text-amber-600 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                        {Number(chef.avg_rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mb-2 line-clamp-2">{chef.bio}</p>
                  <p className="text-xs text-stone-400">{chef.years_experience} yrs exp · {chef.total_events} events</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {chef.cuisine_specialties?.slice(0, 3).map((c: string) => (
                      <span key={c} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">{c}</span>
                    ))}
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
