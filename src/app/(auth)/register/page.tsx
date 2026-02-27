'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { ChefHat } from 'lucide-react'

export default function RegisterPage() {
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
      toast({ title: 'Passwords do not match', variant: 'error' })
      return
    }
    if (form.password.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'error' })
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, role: 'client' },
      },
    })

    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'error' })
      setLoading(false)
      return
    }

    toast({
      title: 'Account created!',
      description: 'Welcome to MyChef.',
      variant: 'success',
    })
    router.push('/dashboard/client')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <ChefHat className="h-8 w-8 text-amber-600" />
          <span className="text-2xl font-bold">MyChef</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Create your account</h1>
        <p className="text-stone-500 mt-1">Start posting events and booking chefs</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              value={form.full_name}
              onChange={updateField('full_name')}
              placeholder="Jane Smith"
              required
            />
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={updateField('password')}
              placeholder="Min. 8 characters"
              required
              hint="At least 8 characters"
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirm}
              onChange={updateField('confirm')}
              placeholder="Repeat password"
              required
            />
            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
          <div className="mt-2 text-center text-sm text-stone-500">
            Want to cook, not book?{' '}
            <Link href="/apply" className="text-amber-600 font-semibold hover:underline">
              Apply as a chef
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
