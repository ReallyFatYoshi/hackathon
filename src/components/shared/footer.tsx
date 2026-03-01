import { Instagram, Twitter, Linkedin } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('footer')
  const tc = await getTranslations('common')
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
              <img src="/icon.png" alt={tc('appName')} className="w-9 h-9 rounded-xl" />
              <span className="font-display text-xl font-semibold tracking-tight text-white">{tc('appName')}</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--muted)' }}>
              {t('description')}
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Instagram, href: '#', label: t('instagram') },
                { icon: Twitter,   href: '#', label: t('twitter') },
                { icon: Linkedin,  href: '#', label: t('linkedin') },
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
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5 text-white">{t('platform')}</h4>
            <ul className="space-y-3">
              {[
                { label: t('findAChef'),    href: '/chefs' },
                { label: t('browseEvents'),  href: '/events' },
                { label: t('becomeAChef'),  href: '/apply' },
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
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5 text-white">{t('account')}</h4>
            <ul className="space-y-3">
              {[
                { label: t('signUp'),   href: '/register' },
                { label: t('signIn'),   href: '/login' },
                { label: t('dashboard'), href: '/dashboard' },
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
                {t('quote')}
              </p>
            </div>
            <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('platformFee')}</p>
              <p className="text-lg font-display font-semibold text-white mt-0.5">{t('feePercent')}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{t('onCompleted')}</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-xs" style={{ color: 'var(--muted)' }}>
          <p>© {new Date().getFullYear()} {tc('appName')}. {t('rights')}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
              {t('systemsOk')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
