import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat, Star } from 'lucide-react'
import { UpdateProfileForm } from './update-form'

export default async function ChefProfilePage() {
  const { user } = await requireAuth()

  const chef = await db.chef.findUnique({ where: { userId: user.id } })
  if (!chef) redirect('/dashboard/chef')

  const reviews = await db.review.findMany({
    where: { chefId: chef.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">My Profile</h1>
        <p className="text-stone-500 mt-1">Manage your public chef profile</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{chef.totalEvents}</p>
            <p className="text-xs text-stone-500">Events Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">⭐ {Number(chef.avgRating).toFixed(1)}</p>
            <p className="text-xs text-stone-500">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{chef.yearsExperience}</p>
            <p className="text-xs text-stone-500">Years Exp.</p>
          </CardContent>
        </Card>
      </div>

      <UpdateProfileForm chef={chef} />

      {reviews && reviews.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Reviews</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-stone-100 pb-4 last:border-0">
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-amber-400 stroke-amber-400' : 'fill-stone-100 stroke-stone-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-stone-700">{review.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
