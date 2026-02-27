'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { EVENT_TYPE_OPTIONS } from '@/lib/utils'

export default function NewEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    event_type: '',
    date: '',
    location: '',
    guest_count: '',
    budget_min: '',
    budget_max: '',
    description: '',
  })

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.event_type) { toast({ title: 'Please select an event type', variant: 'error' }); return }
    if (parseFloat(form.budget_min) > parseFloat(form.budget_max)) {
      toast({ title: 'Minimum budget cannot exceed maximum budget', variant: 'error' }); return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase.from('events').insert({
      client_id: user.id,
      title: form.title,
      event_type: form.event_type,
      date: new Date(form.date).toISOString(),
      location: form.location,
      guest_count: parseInt(form.guest_count),
      budget_min: parseFloat(form.budget_min),
      budget_max: parseFloat(form.budget_max),
      description: form.description,
      status: 'open',
    }).select().single()

    if (error) {
      toast({ title: 'Failed to create event', description: error.message, variant: 'error' })
      setLoading(false)
      return
    }

    toast({ title: 'Event posted!', description: 'Chefs can now apply to your event.', variant: 'success' })
    router.push(`/dashboard/client/events/${data.id}`)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Post an Event</h1>
        <p className="text-stone-500 mt-1">Describe your event and let verified chefs apply</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Event title" value={form.title} onChange={update('title')} placeholder="e.g. Wedding Dinner for 80 Guests" required />
            <Select
              label="Event type"
              placeholder="Select event type"
              value={form.event_type}
              onValueChange={(v) => setForm((prev) => ({ ...prev, event_type: v }))}
              options={EVENT_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))}
              required
            />
            <Input label="Event date & time" type="datetime-local" value={form.date} onChange={update('date')} required />
            <Input label="Location" value={form.location} onChange={update('location')} placeholder="City, Venue Name" required />
            <Input label="Estimated guest count" type="number" min="1" value={form.guest_count} onChange={update('guest_count')} placeholder="50" required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Budget minimum ($)" type="number" min="0" step="50" value={form.budget_min} onChange={update('budget_min')} placeholder="500" required />
              <Input label="Budget maximum ($)" type="number" min="0" step="50" value={form.budget_max} onChange={update('budget_max')} placeholder="2000" required />
            </div>
            <Textarea
              label="Event description"
              value={form.description}
              onChange={update('description')}
              placeholder="Describe the event, cuisine preferences, dietary requirements, serving style, and anything else a chef should know..."
              required
              className="min-h-[140px]"
            />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" loading={loading}>Post Event</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
