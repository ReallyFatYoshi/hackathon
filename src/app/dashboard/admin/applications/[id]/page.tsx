import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { ApplicationActions } from './actions'

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: app } = await supabase
    .from('chef_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!app) notFound()

  const { data: interview } = await supabase
    .from('interviews')
    .select('*')
    .eq('application_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-stone-900">{app.first_name} {app.last_name}</h1>
          {statusBadge(app.status)}
        </div>
        <p className="text-stone-500 text-sm">Applied {formatDate(app.created_at)}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Application details */}
        <Card>
          <CardHeader><CardTitle>Application Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-stone-500">Email</span><p className="font-medium">{app.email}</p></div>
              <div><span className="text-stone-500">Phone</span><p className="font-medium">{app.phone}</p></div>
              <div><span className="text-stone-500">Experience</span><p className="font-medium">{app.years_experience} years</p></div>
            </div>
            <div>
              <span className="text-stone-500">Cuisine Specialties</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {app.cuisine_specialties?.map((c: string) => (
                  <span key={c} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            </div>
            {app.event_specialties?.length > 0 && (
              <div>
                <span className="text-stone-500">Event Specialties</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {app.event_specialties?.map((e: string) => (
                    <span key={e} className="bg-stone-100 text-stone-700 text-xs px-2 py-0.5 rounded-full">{e}</span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <span className="text-stone-500">Bio</span>
              <p className="mt-1 text-stone-700 leading-relaxed">{app.bio}</p>
            </div>
            {app.social_links && Object.keys(app.social_links).length > 0 && (
              <div>
                <span className="text-stone-500">Social Links</span>
                <div className="mt-1 space-y-0.5">
                  {Object.entries(app.social_links as Record<string, string>).map(([k, v]) => (
                    <a key={k} href={v} target="_blank" rel="noreferrer" className="block text-amber-600 hover:underline capitalize">
                      {k}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader><CardTitle>Portfolio Images</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {app.portfolio_images?.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="" className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition-opacity" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview status */}
      {interview && (
        <Card>
          <CardHeader><CardTitle>Interview</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-stone-500">Status:</span>
              {statusBadge(interview.status)}
            </div>
            <div><span className="text-stone-500">Scheduled:</span> <span className="font-medium">{formatDate(interview.scheduled_at)}</span></div>
            <div>
              <span className="text-stone-500">Meeting Link:</span>
              <a href={interview.daily_room_url} target="_blank" rel="noreferrer" className="ml-2 text-amber-600 hover:underline">
                Join Interview Room
              </a>
            </div>
            {interview.notes && (
              <div><span className="text-stone-500">Notes:</span> <span>{interview.notes}</span></div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      <ApplicationActions application={app} interview={interview} />
    </div>
  )
}
