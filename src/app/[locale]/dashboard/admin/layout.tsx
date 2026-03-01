import { requireAuth } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/shared/dashboard-shell'
import type { UserProfile } from '@/types'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/admin', icon: 'Home' },
  { label: 'Applications', href: '/dashboard/admin/applications', icon: 'FileText' },
  { label: 'Interviews', href: '/dashboard/admin/interviews', icon: 'Video' },
  { label: 'Bookings', href: '/dashboard/admin/bookings', icon: 'BookOpen' },
  { label: 'Users', href: '/dashboard/admin/users', icon: 'Users' },
  { label: 'Install App', href: '/dashboard/install', icon: 'Download' },
  { label: 'Security', href: '/dashboard/settings', icon: 'Shield' },
]

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAuth()

  const role = (user as any).role || 'client'
  if (role !== 'admin') redirect('/dashboard')

  const profile: UserProfile = {
    id: user.id,
    role,
    full_name: user.name,
    email: user.email,
    phone: (user as any).phone,
    created_at: user.createdAt?.toISOString?.() || '',
  }

  return (
    <DashboardShell user={profile} items={NAV_ITEMS}>
      {children}
    </DashboardShell>
  )
}
