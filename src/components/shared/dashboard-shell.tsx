'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import {
  ChefHat, LogOut, Home, Calendar, BookOpen, User, Star,
  FileText, Video, Users, MessageSquare,
} from 'lucide-react'
import React from 'react'
import type { UserProfile } from '@/types'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Calendar, BookOpen, User, Star, ChefHat, FileText, Video, Users, MessageSquare,
}

export interface SidebarItem {
  label: string
  href: string
  icon: string
}

interface DashboardShellProps {
  user: UserProfile
  items: SidebarItem[]
  children: React.ReactNode
}

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email ? email[0].toUpperCase() : '?'
}

export function DashboardShell({ user, items, children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--canvas)' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r" style={{ background: 'white', borderColor: 'var(--border)' }}>
        {/* Logo */}
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink)' }}>
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>MyChef</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = ICON_MAP[item.icon] || Home
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-[#C8892A12] text-[#C8892A] border border-[#C8892A25]'
                    : 'border border-transparent hover:bg-stone-50'
                )}
                style={!active ? { color: 'var(--warm-stone)' } : {}}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl" style={{ background: 'var(--parchment)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ background: 'var(--ink)' }}>
              {getInitials(user.full_name, user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--ink)' }}>{user.full_name || user.email}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--muted)' }}>{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-stone-50 border border-transparent"
            style={{ color: 'var(--warm-stone)' }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink)' }}>
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-base font-semibold" style={{ color: 'var(--ink)' }}>MyChef</span>
          </Link>
          <div className="flex gap-1">
            {items.slice(0, 4).map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = ICON_MAP[item.icon] || Home
              return (
                <Link key={item.href} href={item.href}
                  className={cn('p-2 rounded-lg transition-colors', active ? 'bg-[#C8892A12] text-[#C8892A]' : 'text-stone-500')}>
                  <Icon className="h-5 w-5" />
                </Link>
              )
            })}
          </div>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
