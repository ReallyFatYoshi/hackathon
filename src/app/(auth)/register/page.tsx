'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

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

    toast({ title: 'Account created!', description: 'Welcome to MyChef.', variant: 'success' })
    router.push('/dashboard/client')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>Create your account</h1>
        <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>Start posting events and booking chefs</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" value={form.full_name} onChange={updateField('full_name')} placeholder="Jane Smith" required />
        <Input label="Email address" type="email" value={form.email} onChange={updateField('email')} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={updateField('password')} placeholder="Min. 8 characters" required hint="At least 8 characters" />
        <Input label="Confirm password" type="password" value={form.confirm} onChange={updateField('confirm')} placeholder="Repeat password" required />
        <Button type="submit" className="w-full bg-[#0C0907] hover:bg-[#1A1208] text-white border-0 mt-2" size="lg" loading={loading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t space-y-2 text-sm text-center" style={{ borderColor: 'var(--border)' }}>
        <p style={{ color: 'var(--warm-stone)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>Sign in</Link>
        </p>
        <p style={{ color: 'var(--warm-stone)' }}>
          Want to cook, not book?{' '}
          <Link href="/apply" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>Apply as a chef</Link>
        </p>
      </div>
    </div>
  )
}
