'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { ChefHat } from 'lucide-react'

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
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'error' })
      setLoading(false)
      return
    }

    // Get user role and redirect accordingly
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role === 'admin') router.push('/dashboard/admin')
      else if (profile?.role === 'chef') router.push('/dashboard/chef')
      else router.push('/dashboard/client')
    } else {
      router.push(redirectTo)
    }
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <ChefHat className="h-8 w-8 text-amber-600" />
          <span className="text-2xl font-bold">MyChef</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
        <p className="text-stone-500 mt-1">Sign in to your account</p>
      </div>

      <Card>
        <CardContent className="pt-6">
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
            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-amber-600 font-semibold hover:underline">
              Create account
            </Link>
          </div>
          <div className="mt-2 text-center text-sm text-stone-500">
            Want to become a chef?{' '}
            <Link href="/apply" className="text-amber-600 font-semibold hover:underline">
              Apply here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md text-center text-stone-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
