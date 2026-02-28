'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { ChefHat, LogOut, Menu, X } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types'
import { InstallPWA } from './InstallPWA'

interface NavbarProps {
  user?: UserProfile | null
}

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  const dashboardHref =
    user?.role === 'admin'
      ? '/dashboard/admin'
      : user?.role === 'chef'
      ? '/dashboard/chef'
      : '/dashboard/client'

  const publicLinks = [
    { label: 'Find a Chef', href: '/chefs' },
    { label: 'Browse Events', href: '/events' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur-md supports-backdrop-filter:bg-white/80" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink)' }}>
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>MyChef</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-[#C8892A] bg-[#C8892A08]'
                    : 'hover:bg-stone-50'
                )}
                style={{ color: pathname === link.href ? 'var(--gold)' : 'var(--warm-stone)' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <InstallPWA />
            {user ? (
              <>
                <Link href={dashboardHref}>
                  <Button variant="outline" size="sm" className="text-sm" style={{ borderColor: 'var(--border)' }}>Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sm" style={{ color: 'var(--warm-stone)' }}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm" style={{ color: 'var(--warm-stone)' }}>Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-sm bg-[#0C0907] hover:bg-[#1A1208] text-white border-0">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'var(--warm-stone)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 space-y-1 border-t" style={{ borderColor: 'var(--border)' }}>
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href ? 'bg-[#C8892A10] text-[#C8892A]' : 'text-stone-700 hover:bg-stone-50'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false) }}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="block px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: 'var(--gold)' }} onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
            <div className="px-1 pt-1">
              <InstallPWA className="w-full justify-start" />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
