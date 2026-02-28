'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export function ConfirmCompletionButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleConfirm() {
    if (!confirm('Confirm that the event was completed successfully? This will release payment to the chef.')) return
    setLoading(true)
    const res = await fetch('/api/payments/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: data.error, variant: 'error' })
      setLoading(false)
      return
    }
    toast({ title: 'Payment released!', description: 'The chef has been paid.', variant: 'success' })
    router.refresh()
  }

  return (
    <Button size="sm" variant="success" onClick={handleConfirm} loading={loading}>
      Confirm Completion
    </Button>
  )
}
