'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { csrfFetch } from '@/lib/csrf'
import { useToast } from '@/components/ui/toast'

export function ApplyToEventButton({ eventId, chefId }: { eventId: string; chefId: string }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const t = useTranslations('chefApplyButton')
  const tCommon = useTranslations('common')

  async function handleApply() {
    if (!message.trim()) { toast({ title: t('writeMessage'), variant: 'error' }); return }
    setLoading(true)
    const res = await csrfFetch('/api/events/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, chefId, message }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast({ title: t('applicationFailed'), description: data.error || t('somethingWrong'), variant: 'error' })
      setLoading(false)
      return
    }
    toast({ title: t('applicationSent'), variant: 'success' })
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return <Button size="sm" onClick={() => setOpen(true)}>{t('apply')}</Button>
  }

  return (
    <div className="w-72 space-y-2">
      <Textarea
        placeholder={t('messagePlaceholder')}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[90px]"
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>{tCommon('cancel')}</Button>
        <Button size="sm" onClick={handleApply} loading={loading}>{t('sendApplication')}</Button>
      </div>
    </div>
  )
}
