'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { signUp } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  function updateField(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast({ title: t('passwordMismatch'), variant: 'error' })
      return
    }
    if (form.password.length < 8) {
      toast({ title: t('passwordTooShort'), variant: 'error' })
      return
    }

    setLoading(true)
    const { error } = await signUp.email({
      email: form.email,
      password: form.password,
      name: form.full_name,
    })

    if (error) {
      toast({ title: t('registrationFailed'), description: error.message, variant: 'error' })
      setLoading(false)
      return
    }

    toast({ title: t('accountCreated'), description: t('welcomeMsg'), variant: 'success' })
    router.push('/dashboard/client')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>{t('title')}</h1>
        <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('fullName')} value={form.full_name} onChange={updateField('full_name')} placeholder={t('fullNamePlaceholder')} required />
        <Input label={t('email')} type="email" value={form.email} onChange={updateField('email')} placeholder={t('emailPlaceholder')} required />
        <Input label={t('password')} type="password" value={form.password} onChange={updateField('password')} placeholder={t('passwordPlaceholder')} required hint={t('passwordHint')} />
        <Input label={t('confirmPassword')} type="password" value={form.confirm} onChange={updateField('confirm')} placeholder={t('confirmPlaceholder')} required />
        <Button type="submit" className="w-full bg-[#0C0907] hover:bg-[#1A1208] text-white border-0 mt-2" size="lg" loading={loading}>
          {t('submit')}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t space-y-2 text-sm text-center" style={{ borderColor: 'var(--border)' }}>
        <p style={{ color: 'var(--warm-stone)' }}>
          {t('hasAccount')}{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>{t('signIn')}</Link>
        </p>
        <p style={{ color: 'var(--warm-stone)' }}>
          {t('wantCook')}{' '}
          <Link href="/apply" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>{t('applyAsChef')}</Link>
        </p>
      </div>
    </div>
  )
}
