import { requireAuth } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'

export default async function DashboardRedirectPage() {
  const { user } = await requireAuth()

  const role = (user as any).role

  if (role === 'admin') redirect('/dashboard/admin')
  if (role === 'chef') redirect('/dashboard/chef')
  redirect('/dashboard/client')
}
