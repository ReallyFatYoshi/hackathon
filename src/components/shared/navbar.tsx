'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ChefHat, LogOut, Menu, X } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types'

interface NavbarProps {
  user?: UserProfile | null
}

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
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
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-stone-900 hover:opacity-80 transition-opacity">
            <ChefHat className="h-7 w-7 text-amber-600" />
            <span className="text-xl font-bold tracking-tight">MyChef</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-amber-600'
                    : 'text-stone-600 hover:text-stone-900'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href={dashboardHref}>
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-stone-100">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-2 py-1.5 text-sm font-medium text-stone-700 hover:text-amber-600"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="block px-2 py-1.5 text-sm font-medium text-stone-700"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false) }}
                  className="block w-full text-left px-2 py-1.5 text-sm font-medium text-stone-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-2 py-1.5 text-sm font-medium text-stone-700" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="block px-2 py-1.5 text-sm font-semibold text-amber-600" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
