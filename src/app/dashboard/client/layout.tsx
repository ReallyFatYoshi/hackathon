import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/shared/dashboard-shell'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/client', icon: 'Home' },
  { label: 'My Events', href: '/dashboard/client/events', icon: 'Calendar' },
  { label: 'Find Chefs', href: '/dashboard/client/chefs', icon: 'ChefHat' },
  { label: 'My Bookings', href: '/dashboard/client/bookings', icon: 'BookOpen' },
]

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role === 'admin') redirect('/dashboard/admin')
  if (profile.role === 'chef') redirect('/dashboard/chef')

  return (
    <DashboardShell user={profile} items={NAV_ITEMS}>
      {children}
    </DashboardShell>
  )
}
