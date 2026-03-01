import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { getSession } from '@/lib/auth-helpers'
import type { UserProfile } from '@/types'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  let profile: UserProfile | null = null
  if (session?.user) {
    const user = session.user
    profile = {
      id: user.id,
      role: (user as any).role || 'client',
      full_name: user.name,
      email: user.email,
      phone: (user as any).phone,
      created_at: user.createdAt?.toISOString?.() || '',
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
