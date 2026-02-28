'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

function LoginForm() {
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
        <h1 className="font-display text-3xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>Welcome back</h1>
        <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full bg-[#0C0907] hover:bg-[#1A1208] text-white border-0 mt-2" size="lg" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t space-y-2 text-sm text-center" style={{ borderColor: 'var(--border)' }}>
        <p style={{ color: 'var(--warm-stone)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>
            Create account
          </Link>
        </p>
        <p style={{ color: 'var(--warm-stone)' }}>
          Want to become a chef?{' '}
          <Link href="/apply" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>
            Apply here
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
