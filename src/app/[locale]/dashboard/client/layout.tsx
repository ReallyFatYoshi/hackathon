import { requireAuth } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/shared/dashboard-shell'
import type { UserProfile } from '@/types'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/client', icon: 'Home' },
  { label: 'My Events', href: '/dashboard/client/events', icon: 'Calendar' },
  { label: 'Find Chefs', href: '/dashboard/client/chefs', icon: 'ChefHat' },
  { label: 'My Bookings', href: '/dashboard/client/bookings', icon: 'BookOpen' },
  { label: 'Messages', href: '/dashboard/client/messages', icon: 'MessageSquare' },
  { label: 'Install App', href: '/dashboard/install', icon: 'Download' },
  { label: 'Security', href: '/dashboard/settings', icon: 'Shield' },
]

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAuth()

  const role = (user as any).role || 'client'
  if (role === 'admin') redirect('/dashboard/admin')
  if (role === 'chef') redirect('/dashboard/chef')

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
