'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { csrfFetch } from '@/lib/csrf'
import { useToast } from '@/components/ui/toast'
import { EVENT_TYPE_OPTIONS } from '@/lib/utils'

export default function NewEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    eventType: '',
    date: '',
    location: '',
    guestCount: '',
    budgetMin: '',
    budgetMax: '',
    description: '',
  })

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.eventType) { toast({ title: 'Please select an event type', variant: 'error' }); return }
    if (parseFloat(form.budgetMin) > parseFloat(form.budgetMax)) {
      toast({ title: 'Minimum budget cannot exceed maximum budget', variant: 'error' }); return
    }

    setLoading(true)
    const res = await csrfFetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        eventType: form.eventType,
        date: new Date(form.date).toISOString(),
        location: form.location,
        guestCount: parseInt(form.guestCount),
        budgetMin: parseFloat(form.budgetMin),
        budgetMax: parseFloat(form.budgetMax),
        description: form.description,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      toast({ title: 'Failed to create event', description: data.error, variant: 'error' })
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
              value={form.eventType}
              onValueChange={(v) => setForm((prev) => ({ ...prev, eventType: v }))}
              options={EVENT_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))}
              required
            />
            <Input label="Event date & time" type="datetime-local" value={form.date} onChange={update('date')} required />
            <Input label="Location" value={form.location} onChange={update('location')} placeholder="City, Venue Name" required />
            <Input label="Estimated guest count" type="number" min="1" value={form.guestCount} onChange={update('guestCount')} placeholder="50" required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Budget minimum ($)" type="number" min="0" step="50" value={form.budgetMin} onChange={update('budgetMin')} placeholder="500" required />
              <Input label="Budget maximum ($)" type="number" min="0" step="50" value={form.budgetMax} onChange={update('budgetMax')} placeholder="2000" required />
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
