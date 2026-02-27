import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">All Users</h1>
        <p className="text-stone-500 mt-1">{profiles?.length || 0} registered users</p>
      </div>

      <div className="space-y-2">
        {profiles?.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-stone-900">{profile.full_name || '(no name)'}</p>
                  <p className="text-xs text-stone-500">{profile.email}</p>
                  <p className="text-xs text-stone-400">{formatDate(profile.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    profile.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    profile.role === 'chef' ? 'bg-amber-100 text-amber-700' :
                    'bg-stone-100 text-stone-700'
                  }`}>{profile.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
