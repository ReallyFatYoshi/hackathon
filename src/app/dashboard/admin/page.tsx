import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { statusBadge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { FileText, Users, BookOpen, Video } from 'lucide-react'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [appsRes, usersRes, bookingsRes, interviewsRes] = await Promise.all([
    supabase.from('chef_applications').select('id, status, first_name, last_name, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('interviews').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
  ])

  const pendingApps = (appsRes.data || []).filter((a) => a.status === 'pending_review')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>Admin Dashboard</h1>
        <p className="mt-1" style={{ color: 'var(--warm-stone)' }}>Platform overview and management</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/dashboard/admin/applications">
          <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow cursor-pointer" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#C8892A10' }}>
                  <FileText className="h-5 w-5" style={{ color: '#C8892A' }} />
                </div>
                <div>
                  <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{pendingApps.length}</p>
                  <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>Pending Apps</p>
                </div>
              </div>
          </div>
        </Link>
        <Link href="/dashboard/admin/interviews">
          <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow cursor-pointer" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                  <Video className="h-5 w-5" style={{ color: '#2563EB' }} />
                </div>
                <div>
                  <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{interviewsRes.count || 0}</p>
                  <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>Scheduled Interviews</p>
                </div>
              </div>
          </div>
        </Link>
        <Link href="/dashboard/admin/users">
          <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow cursor-pointer" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F5F3FF' }}>
                  <Users className="h-5 w-5" style={{ color: '#7C3AED' }} />
                </div>
                <div>
                  <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{usersRes.count || 0}</p>
                  <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>Total Users</p>
                </div>
              </div>
          </div>
        </Link>
        <Link href="/dashboard/admin/bookings">
          <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow cursor-pointer" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ECFDF5' }}>
                  <BookOpen className="h-5 w-5" style={{ color: '#059669' }} />
                </div>
                <div>
                  <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{bookingsRes.count || 0}</p>
                  <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>Total Bookings</p>
                </div>
              </div>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--ink)' }}>Recent Applications</h3>
            <Link href="/dashboard/admin/applications" className="text-xs hover:underline" style={{ color: 'var(--gold)' }}>View all</Link>
          </div>
        </div>
        <div className="p-6">
          {!appsRes.data || appsRes.data.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--muted)' }}>No applications yet</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {appsRes.data.map((app) => (
                <Link key={app.id} href={`/dashboard/admin/applications/${app.id}`}>
                  <div className="flex items-center justify-between py-3 hover:bg-stone-50 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--ink)' }}>{app.first_name} {app.last_name}</p>
                      <p className="text-xs" style={{ color: 'var(--warm-stone)' }}>{formatDate(app.created_at)}</p>
                    </div>
                    {statusBadge(app.status)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
