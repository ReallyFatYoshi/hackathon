import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        <h1 className="text-2xl font-bold text-stone-900">Admin Dashboard</h1>
        <p className="text-stone-500 mt-1">Platform overview and management</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/dashboard/admin/applications">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingApps.length}</p>
                  <p className="text-sm text-stone-500">Pending Apps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/admin/interviews">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Video className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{interviewsRes.count || 0}</p>
                  <p className="text-sm text-stone-500">Scheduled Interviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{usersRes.count || 0}</p>
                  <p className="text-sm text-stone-500">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/admin/bookings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bookingsRes.count || 0}</p>
                  <p className="text-sm text-stone-500">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/dashboard/admin/applications" className="text-xs text-amber-600 hover:underline">View all</Link>
          </div>
        </CardHeader>
        <CardContent>
          {!appsRes.data || appsRes.data.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">No applications yet</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {appsRes.data.map((app) => (
                <Link key={app.id} href={`/dashboard/admin/applications/${app.id}`}>
                  <div className="flex items-center justify-between py-3 hover:bg-stone-50 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium text-stone-900 text-sm">{app.first_name} {app.last_name}</p>
                      <p className="text-xs text-stone-500">{formatDate(app.created_at)}</p>
                    </div>
                    {statusBadge(app.status)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
