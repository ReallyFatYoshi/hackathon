import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/shared/dashboard-shell'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/admin', icon: 'Home' },
  { label: 'Applications', href: '/dashboard/admin/applications', icon: 'FileText' },
  { label: 'Interviews', href: '/dashboard/admin/interviews', icon: 'Video' },
  { label: 'Bookings', href: '/dashboard/admin/bookings', icon: 'BookOpen' },
  { label: 'Users', href: '/dashboard/admin/users', icon: 'Users' },
]

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <DashboardShell user={profile} items={NAV_ITEMS}>
      {children}
    </DashboardShell>
  )
}
