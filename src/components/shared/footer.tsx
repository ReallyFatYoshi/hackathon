import { ChefHat, Instagram, Twitter, Linkedin } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: 'var(--ink)', color: 'var(--canvas)' }}>
      {/* Subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_0%,#3d1f0033,transparent)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 py-16 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
                <ChefHat className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              </div>
              <span className="font-display text-xl font-semibold tracking-tight text-white">MyChef</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--muted)' }}>
              Connecting institutions and individuals with verified professional chefs for extraordinary catering and event services.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter,   href: '#', label: 'Twitter' },
                { icon: Linkedin,  href: '#', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors hover:border-[#C8892A] hover:text-[#C8892A]"
                  style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'var(--muted)' }}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5 text-white">Platform</h4>
            <ul className="space-y-3">
              {[
                { label: 'Find a Chef',    href: '/chefs' },
                { label: 'Browse Events',  href: '/events' },
                { label: 'Become a Chef',  href: '/apply' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5 text-white">Account</h4>
            <ul className="space-y-3">
              {[
                { label: 'Sign Up',   href: '/register' },
                { label: 'Sign In',   href: '/login' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quote */}
          <div className="md:col-span-1 flex flex-col justify-between">
            <div>
              <div className="font-display text-5xl leading-none mb-3" style={{ color: 'var(--gold)' }}>&ldquo;</div>
              <p className="font-display text-lg italic leading-snug" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Every great meal begins with a great chef.
              </p>
            </div>
            <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Platform fee</p>
              <p className="text-lg font-display font-semibold text-white mt-0.5">15%</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>on completed bookings</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-xs" style={{ color: 'var(--muted)' }}>
          <p>© {new Date().getFullYear()} MyChef. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
