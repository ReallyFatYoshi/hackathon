'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SelectChefButtonProps {
  applicationId: string
  eventId: string
  chefId: string
  budgetMax: number
}

export function SelectChefButton({ applicationId, eventId, chefId, budgetMax }: SelectChefButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSelect() {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, eventId, chefId, amount: budgetMax }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create booking')

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast({ title: 'Booking created', variant: 'success' })
        router.refresh()
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'error' })
      setLoading(false)
    }
  }

  return (
    <Button size="sm" onClick={handleSelect} loading={loading}>
      Select & Pay
    </Button>
  )
}
