'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get booking details to extract chef_id
    const { data: booking } = await supabase
      .from('bookings')
      .select('chef_id, client_id')
      .eq('id', bookingId)
      .single()

    if (!booking) { toast({ title: 'Booking not found', variant: 'error' }); setLoading(false); return }

    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      client_id: user.id,
      chef_id: booking.chef_id,
      rating,
      comment,
    })

    if (error) {
      toast({ title: 'Failed to submit review', description: error.message, variant: 'error' })
      setLoading(false)
      return
    }

    // Update chef's total_events count
    const { data: chef } = await supabase.from('chefs').select('total_events').eq('id', booking.chef_id).single()
    if (chef) {
      await supabase.from('chefs').update({ total_events: (chef.total_events || 0) + 1 }).eq('id', booking.chef_id)
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
