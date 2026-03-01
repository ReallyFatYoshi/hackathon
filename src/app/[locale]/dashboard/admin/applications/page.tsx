import { requireRole } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { statusBadge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { FileText } from 'lucide-react'

export default async function AdminApplicationsPage() {
  await requireRole('admin')

  const applications = await db.chefApplication.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const pending = applications.filter((a) => a.status === 'pending_review')
  const others = applications.filter((a) => a.status !== 'pending_review')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Chef Applications</h1>
        <p className="text-stone-500 mt-1">{pending.length} pending review</p>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-3">
          {[...pending, ...others].map((app) => (
            <Link key={app.id} href={`/dashboard/admin/applications/${app.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-stone-900">{app.firstName} {app.lastName}</p>
                        {statusBadge(app.status)}
                      </div>
                      <p className="text-sm text-stone-500">{app.email} · {app.yearsExperience} yrs experience</p>
                      <p className="text-xs text-stone-400 mt-0.5">Applied {formatDate(app.createdAt.toISOString())}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                      {app.cuisineSpecialties?.slice(0, 2).map((c: string) => (
                        <span key={c} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500 text-sm">No applications yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
