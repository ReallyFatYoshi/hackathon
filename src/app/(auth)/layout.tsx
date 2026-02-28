import Link from 'next/link'
import { ChefHat } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col w-[42%] relative overflow-hidden" style={{ background: 'var(--ink)' }}>
        {/* Background radials */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_30%,_#3d1f0044,_transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,_#1a0e0066,_transparent)]" />

        {/* Content */}
        <div className="relative flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 w-fit group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)' }}>
              <ChefHat className="h-5 w-5" style={{ color: 'var(--gold)' }} />
            </div>
            <span className="font-display text-xl font-semibold text-white tracking-tight">MyChef</span>
          </Link>

          {/* Center quote */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="font-display text-[5rem] leading-none mb-4" style={{ color: 'var(--gold)', opacity: 0.6 }}>&ldquo;</div>
            <p className="font-display text-3xl font-light italic leading-snug text-white mb-6">
              Every great meal begins<br />with a great chef.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-px" style={{ background: 'var(--gold)' }} />
              <span className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--gold)' }}>
                Since 2024
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {[
              { value: '200+',   label: 'Chefs' },
              { value: '1,500+', label: 'Events' },
              { value: '4.9★',   label: 'Rating' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-xl font-semibold" style={{ color: 'var(--gold)' }}>{s.value}</div>
                <div className="text-xs uppercase tracking-widest mt-0.5" style={{ color: 'var(--muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col" style={{ background: 'var(--canvas)' }}>
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink)' }}>
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>MyChef</span>
          </Link>
        </div>

        <main className="flex-1 flex items-center justify-center py-12 px-6 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
