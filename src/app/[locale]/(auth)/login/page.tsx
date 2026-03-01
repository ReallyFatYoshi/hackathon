'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

function LoginForm() {
  const t = useTranslations('auth.login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn.email({ email, password })
    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'error' })
      setLoading(false)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>{t('title')}</h1>
        <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          required
          autoComplete="email"
        />
        <Input
          label={t('password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('passwordPlaceholder')}
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full bg-[#0C0907] hover:bg-[#1A1208] text-white border-0 mt-2" size="lg" loading={loading}>
          {t('submit')}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t space-y-2 text-sm text-center" style={{ borderColor: 'var(--border)' }}>
        <p style={{ color: 'var(--warm-stone)' }}>
          {t('noAccount')}{' '}
          <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>
            {t('createAccount')}
          </Link>
        </p>
        <p style={{ color: 'var(--warm-stone)' }}>
          {t('wantChef')}{' '}
          <Link href="/apply" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>
            {t('applyHere')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm text-center" style={{ color: 'var(--muted)' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
