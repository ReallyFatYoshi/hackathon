'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ChefHat, LogOut, type LucideIcon } from 'lucide-react'
import React from 'react'
import type { UserProfile } from '@/types'

interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
}

interface DashboardShellProps {
  user: UserProfile
  items: SidebarItem[]
  children: React.ReactNode
}

export function DashboardShell({ user, items, children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-stone-200 shrink-0">
        <div className="p-5 border-b border-stone-100">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-amber-600" />
            <span className="font-bold text-stone-900">MyChef</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-stone-100">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-stone-900 truncate">{user.full_name || user.email}</p>
            <p className="text-xs text-stone-400 capitalize">{user.role}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-stone-200 bg-white">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-amber-600" />
            <span className="font-bold">MyChef</span>
          </Link>
          <div className="flex gap-1">
            {items.slice(0, 4).map((item) => (
              <Link key={item.href} href={item.href} className={cn(
                'p-2 rounded-lg text-stone-600',
                pathname === item.href && 'bg-amber-50 text-amber-700'
              )}>
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
