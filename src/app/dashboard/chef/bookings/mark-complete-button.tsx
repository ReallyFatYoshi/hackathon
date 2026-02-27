'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export function MarkCompleteButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleMark() {
    if (!confirm('Mark this event as completed? The client will be asked to confirm.')) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({ chef_completed_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'error' })
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
