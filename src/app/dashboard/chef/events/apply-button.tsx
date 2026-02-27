'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'

export function ApplyToEventButton({ eventId, chefId }: { eventId: string; chefId: string }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleApply() {
    if (!message.trim()) { toast({ title: 'Please write a message', variant: 'error' }); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('event_applications').insert({
      event_id: eventId,
      chef_id: chefId,
      message,
      status: 'pending',
    })
    if (error) {
      toast({ title: 'Application failed', description: error.message, variant: 'error' })
      setLoading(false)
      return
    }
    toast({ title: 'Application sent!', variant: 'success' })
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return <Button size="sm" onClick={() => setOpen(true)}>Apply</Button>
  }

  return (
    <div className="w-72 space-y-2">
      <Textarea
        placeholder="Introduce yourself and explain why you're the right chef for this event..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[90px]"
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        <Button size="sm" onClick={handleApply} loading={loading}>Send Application</Button>
      </div>
    </div>
  )
}
