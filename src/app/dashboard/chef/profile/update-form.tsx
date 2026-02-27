'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { CUISINE_OPTIONS, EVENT_TYPE_OPTIONS, cn } from '@/lib/utils'
import type { Chef } from '@/types'

export function UpdateProfileForm({ chef }: { chef: Chef }) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bio, setBio] = useState(chef.bio)
  const [cuisines, setCuisines] = useState<string[]>(chef.cuisine_specialties)
  const [events, setEvents] = useState<string[]>(chef.event_specialties)

  function toggleCuisine(c: string) {
    setCuisines((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }
  function toggleEvent(e: string) {
    setEvents((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e])
  }

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('chefs')
      .update({ bio, cuisine_specialties: cuisines, event_specialties: events })
      .eq('id', chef.id)

    if (error) {
      toast({ title: 'Failed to update profile', description: error.message, variant: 'error' })
    } else {
      toast({ title: 'Profile updated!', variant: 'success' })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px]" />
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Cuisine Specialties</label>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((c) => (
              <button key={c} type="button" onClick={() => toggleCuisine(c)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  cuisines.includes(c) ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-stone-600 border-stone-300 hover:border-amber-400'
                )}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Event Specialties</label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPE_OPTIONS.map((e) => (
              <button key={e} type="button" onClick={() => toggleEvent(e)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  events.includes(e) ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
                )}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={handleSave} loading={loading}>Save Changes</Button>
      </CardContent>
    </Card>
  )
}
