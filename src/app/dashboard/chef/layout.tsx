import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/shared/dashboard-shell'
import { Home, Calendar, BookOpen, User } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/chef', icon: Home },
  { label: 'Browse Events', href: '/dashboard/chef/events', icon: Calendar },
  { label: 'My Bookings', href: '/dashboard/chef/bookings', icon: BookOpen },
  { label: 'My Profile', href: '/dashboard/chef/profile', icon: User },
]

export default async function ChefDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  if (profile.role === 'admin') redirect('/dashboard/admin')
  if (profile.role === 'client') redirect('/dashboard/client')

  return (
    <DashboardShell user={profile} items={NAV_ITEMS}>
      {children}
    </DashboardShell>
  )
}
