'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { csrfFetch } from '@/lib/csrf'
import { useToast } from '@/components/ui/toast'
import { CUISINE_OPTIONS, EVENT_TYPE_OPTIONS, cn } from '@/lib/utils'
import { Upload, X, ImageIcon } from 'lucide-react'
import type { Chef } from '@prisma/client'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

export function UpdateProfileForm({ chef }: { chef: Chef }) {
  const t = useTranslations('chefProfile')
  const { toast } = useToast()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [bio, setBio] = useState(chef.bio)
  const [cuisines, setCuisines] = useState<string[]>(chef.cuisineSpecialties)
  const [events, setEvents] = useState<string[]>(chef.eventSpecialties)
  const [images, setImages] = useState<string[]>(chef.portfolioImages || [])

  function toggleCuisine(c: string) {
    setCuisines((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }
  function toggleEvent(e: string) {
    setEvents((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e])
  }

  async function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) {
      toast({ title: t('maxImages'), variant: 'error' })
      return
    }
    const dataUrls = await Promise.all(files.map(fileToDataUrl))
    setImages((prev) => [...prev, ...dataUrls])
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setLoading(true)
    const res = await csrfFetch('/api/chef/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio,
        cuisineSpecialties: cuisines,
        eventSpecialties: events,
        portfolioImages: images,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast({ title: t('updateFailed'), description: data.error || 'Something went wrong', variant: 'error' })
    } else {
      toast({ title: t('updated'), variant: 'success' })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader><CardTitle>{t('editProfile')}</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {/* Portfolio Images */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            {t('portfolioImages')}
            <span className="text-stone-400 font-normal text-xs ml-1">({images.length}/5)</span>
          </label>
          <div className="grid grid-cols-5 gap-2.5">
            {images.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 group shadow-sm">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
                <Upload className="h-4 w-4 text-stone-300 mb-1" />
                <span className="text-[9px] text-stone-400 font-medium">{t('addPhoto')}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageAdd}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {images.length === 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-stone-400">
              <ImageIcon className="h-3.5 w-3.5" />
              {t('noImages')}
            </div>
          )}
        </div>

        <Textarea label={t('bioLabel')} value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px]" />
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">{t('cuisineLabel')}</label>
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
          <label className="block text-sm font-medium text-stone-700 mb-2">{t('eventLabel')}</label>
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
        <Button onClick={handleSave} loading={loading}>{t('saveChanges')}</Button>
      </CardContent>
    </Card>
  )
}
