import { requireAuth } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/shared/dashboard-shell'
import type { UserProfile } from '@/types'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/chef', icon: 'Home' },
  { label: 'Browse Events', href: '/dashboard/chef/events', icon: 'Calendar' },
  { label: 'My Bookings', href: '/dashboard/chef/bookings', icon: 'BookOpen' },
  { label: 'My Profile', href: '/dashboard/chef/profile', icon: 'User' },
  { label: 'Messages', href: '/dashboard/chef/messages', icon: 'MessageSquare' },
  { label: 'Install App', href: '/dashboard/install', icon: 'Download' },
  { label: 'Security', href: '/dashboard/settings', icon: 'Shield' },
]

export default async function ChefDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAuth()

  const role = (user as any).role || 'client'
  // Only redirect admins — clients who have applied can access this dashboard to track their status
  if (role === 'admin') redirect('/dashboard/admin')

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
