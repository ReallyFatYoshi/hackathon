import { requireRole } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { statusBadge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { FileText, Users, BookOpen, Video } from 'lucide-react'

export default async function AdminOverviewPage() {
  await requireRole('admin')
  const t = await getTranslations('admin')
  const tCommon = await getTranslations('common')
  const tBadges = await getTranslations('badges')

  const [recentApps, usersCount, bookingsCount, scheduledInterviewsCount] = await Promise.all([
    db.chefApplication.findMany({
      select: { id: true, status: true, firstName: true, lastName: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.user.count(),
    db.booking.count(),
    db.interview.count({ where: { status: 'scheduled' } }),
  ])

  const pendingApps = recentApps.filter((a) => a.status === 'pending_review')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{t('title')}</h1>
        <p className="mt-1" style={{ color: 'var(--warm-stone)' }}>{t('subtitle')}</p>
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
                  <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('pendingApps')}</p>
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
                  <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{scheduledInterviewsCount}</p>
                  <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('scheduledInterviews')}</p>
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
                  <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{usersCount}</p>
                  <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('totalUsers')}</p>
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
                  <p className="font-display text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{bookingsCount}</p>
                  <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('totalBookings')}</p>
                </div>
              </div>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--ink)' }}>{t('recentApplications')}</h3>
            <Link href="/dashboard/admin/applications" className="text-xs hover:underline" style={{ color: 'var(--gold)' }}>{tCommon('viewAll')}</Link>
          </div>
        </div>
        <div className="p-6">
          {recentApps.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--muted)' }}>{t('noApplications')}</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentApps.map((app) => (
                <Link key={app.id} href={`/dashboard/admin/applications/${app.id}`}>
                  <div className="flex items-center justify-between py-3 hover:bg-stone-50 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--ink)' }}>{app.firstName} {app.lastName}</p>
                      <p className="text-xs" style={{ color: 'var(--warm-stone)' }}>{formatDate(app.createdAt.toISOString())}</p>
                    </div>
                    {statusBadge(app.status, tBadges)}
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
