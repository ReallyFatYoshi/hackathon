'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { csrfFetch } from '@/lib/csrf'
import { useToast } from '@/components/ui/toast'

export function MarkCompleteButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleMark() {
    if (!confirm('Mark this event as completed? The client will be asked to confirm.')) return
    setLoading(true)
    const res = await csrfFetch('/api/bookings/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast({ title: 'Error', description: data.error || 'Something went wrong', variant: 'error' })
      setLoading(false)
      return
    }
    toast({ title: 'Marked as complete!', description: 'Awaiting client confirmation.', variant: 'success' })
    router.refresh()
  }

  return (
    <Button size="sm" variant="success" onClick={handleMark} loading={loading}>
      Mark Complete
    </Button>
  )
}
