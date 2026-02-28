import { requireRole } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { ApplicationActions } from './actions'

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireRole('admin')

  const app = await db.chefApplication.findUnique({ where: { id } })
  if (!app) notFound()

  const interview = await db.interview.findFirst({
    where: { applicationId: id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-stone-900">{app.firstName} {app.lastName}</h1>
          {statusBadge(app.status)}
        </div>
        <p className="text-stone-500 text-sm">Applied {formatDate(app.createdAt.toISOString())}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Application details */}
        <Card>
          <CardHeader><CardTitle>Application Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-stone-500">Email</span><p className="font-medium">{app.email}</p></div>
              <div><span className="text-stone-500">Phone</span><p className="font-medium">{app.phone}</p></div>
              <div><span className="text-stone-500">Experience</span><p className="font-medium">{app.yearsExperience} years</p></div>
            </div>
            <div>
              <span className="text-stone-500">Cuisine Specialties</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {app.cuisineSpecialties?.map((c: string) => (
                  <span key={c} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            </div>
            {app.eventSpecialties?.length > 0 && (
              <div>
                <span className="text-stone-500">Event Specialties</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {app.eventSpecialties?.map((e: string) => (
                    <span key={e} className="bg-stone-100 text-stone-700 text-xs px-2 py-0.5 rounded-full">{e}</span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <span className="text-stone-500">Bio</span>
              <p className="mt-1 text-stone-700 leading-relaxed">{app.bio}</p>
            </div>
            {app.socialLinks && Object.keys(app.socialLinks as Record<string, string>).length > 0 && (
              <div>
                <span className="text-stone-500">Social Links</span>
                <div className="mt-1 space-y-0.5">
                  {Object.entries(app.socialLinks as Record<string, string>).map(([k, v]) => (
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
              {app.portfolioImages?.map((url: string, i: number) => (
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
            <div><span className="text-stone-500">Scheduled:</span> <span className="font-medium">{formatDate(interview.scheduledAt.toISOString())}</span></div>
            <div>
              <span className="text-stone-500">Meeting Link:</span>
              <a href={interview.dailyRoomUrl} target="_blank" rel="noreferrer" className="ml-2 text-amber-600 hover:underline">
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
      <ApplicationActions
        application={{
          id: app.id,
          user_id: app.userId ?? '',
          status: app.status as any,
          applicant_type: app.applicantType as any,
          company_name: app.companyName ?? undefined,
          first_name: app.firstName,
          last_name: app.lastName,
          email: app.email,
          phone: app.phone,
          years_experience: app.yearsExperience,
          cuisine_specialties: app.cuisineSpecialties,
          event_specialties: app.eventSpecialties,
          bio: app.bio,
          portfolio_images: app.portfolioImages,
          social_links: (app.socialLinks as Record<string, string>) ?? undefined,
          admin_notes: app.adminNotes ?? undefined,
          created_at: app.createdAt.toISOString(),
          updated_at: app.updatedAt.toISOString(),
        }}
        interview={interview ? {
          id: interview.id,
          application_id: interview.applicationId,
          scheduled_at: interview.scheduledAt.toISOString(),
          daily_room_url: interview.dailyRoomUrl,
          daily_room_name: interview.dailyRoomName,
          status: interview.status as any,
          notes: interview.notes ?? undefined,
          created_at: interview.createdAt.toISOString(),
        } : null}
      />
    </div>
  )
}
