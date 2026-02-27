'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export function AdminBookingActions({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  async function handleAction(action: 'release' | 'refund') {
    setLoading(action)
    const endpoint = action === 'release' ? '/api/payments/release' : '/api/payments/refund'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: data.error, variant: 'error' })
    } else {
      toast({ title: action === 'release' ? 'Payment released' : 'Payment refunded', variant: 'success' })
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="success" loading={loading === 'release'} onClick={() => handleAction('release')}>
        Release Payment
      </Button>
      <Button size="sm" variant="destructive" loading={loading === 'refund'} onClick={() => handleAction('refund')}>
        Refund
      </Button>
    </div>
  )
}
