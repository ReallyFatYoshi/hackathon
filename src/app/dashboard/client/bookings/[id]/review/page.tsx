'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { csrfFetch } from '@/lib/csrf'
import { useToast } from '@/components/ui/toast'
import { Star } from 'lucide-react'

export default function LeaveReviewPage() {
  const params = useParams()
  const bookingId = params.id as string
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { toast({ title: 'Please select a rating', variant: 'error' }); return }

    setLoading(true)
    const res = await csrfFetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, rating, comment }),
    })
    const data = await res.json()

    if (!res.ok) {
      toast({ title: 'Failed to submit review', description: data.error, variant: 'error' })
      setLoading(false)
      return
    }

    toast({ title: 'Review submitted!', variant: 'success' })
    router.push('/dashboard/client/bookings')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Leave a Review</h1>
        <p className="text-stone-500 mt-1">Share your experience to help other clients</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star className={`h-8 w-8 transition-colors ${
                      star <= (hovered || rating)
                        ? 'fill-amber-400 stroke-amber-400'
                        : 'fill-stone-100 stroke-stone-300'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label="Your review"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your experience with this chef..."
              required
              className="min-h-[120px]"
            />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" loading={loading}>Submit Review</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
