import Link from 'next/link'
import { getSession } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import {
  ChefHat,
  Star,
  Shield,
  Calendar,
  CreditCard,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

export default async function HomePage() {
  const session = await getSession()

  let profile = null
  if (session?.user) {
    const u = session.user as any
    profile = { id: u.id, role: u.role || 'client', full_name: u.name, email: u.email, phone: u.phone, created_at: '' }
  }

  const featuredChefs = await db.chef.findMany({
    where: { isVisible: true },
    select: { id: true, firstName: true, lastName: true, bio: true, cuisineSpecialties: true, portfolioImages: true, avgRating: true, totalEvents: true },
    orderBy: { avgRating: 'desc' },
    take: 3,
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0C0907] text-white min-h-[92vh] flex flex-col justify-center grain">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_20%,_#3d1f0055,_transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_80%,_#1a0e0044,_transparent)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          {/* Eyebrow */}
          <div className="animate-fade-up flex items-center gap-3 mb-10">
            <div className="w-8 h-px" style={{ background: 'var(--gold)' }} />
            <span className="text-xs uppercase tracking-[0.25em] font-medium" style={{ color: 'var(--gold)' }}>
              Verified Professionals Only
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display animate-fade-up delay-100">
            <span className="block text-[clamp(3.5rem,12vw,10rem)] font-light leading-[0.88] tracking-tight text-white">
              Exceptional
            </span>
            <span className="block text-[clamp(2rem,6vw,6rem)] font-light leading-none tracking-tight italic mt-3" style={{ color: '#E5DDD0' }}>
              Culinary Experiences,
            </span>
            <span className="block text-[clamp(2rem,6vw,6rem)] font-semibold leading-none mt-2 text-shimmer">
              Delivered.
            </span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-up delay-300 mt-10 text-lg leading-relaxed max-w-lg" style={{ color: 'var(--muted)' }}>
            MyChef connects you with verified professional chefs for weddings, corporate events, private dinners, and more. Every chef is personally vetted and interviewed.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-400 flex flex-col sm:flex-row gap-4 mt-10">
            <Link href="/chefs">
              <Button size="lg" className="bg-[#C8892A] hover:bg-[#A0621A] text-white font-medium tracking-wide border-0 w-full sm:w-auto">
                Find a Chef
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/apply">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 tracking-wide w-full sm:w-auto">
                Apply as a Chef
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {[
                { value: '200+',   label: 'Verified Chefs' },
                { value: '1,500+', label: 'Events Catered' },
                { value: '900+',   label: 'Happy Clients' },
                { value: '4.9★',   label: 'Average Rating' },
              ].map((stat, i) => (
                <div key={stat.label} className={`py-6 px-6 text-center animate-fade-up delay-${500 + i * 100}`}>
                  <div className="font-display text-2xl font-semibold" style={{ color: 'var(--gold)' }}>{stat.value}</div>
                  <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--warm-stone)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="py-28 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-5 mb-16">
            <div className="w-10 h-px mt-4 shrink-0" style={{ background: 'var(--gold)' }} />
            <div>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light" style={{ color: 'var(--ink)' }}>
                How MyChef Works
              </h2>
              <p className="mt-3 max-w-md leading-relaxed" style={{ color: 'var(--warm-stone)' }}>
                A seamless journey from posting your event to enjoying a world-class culinary experience.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Calendar,   step: '01', title: 'Post Your Event',     desc: 'Describe your event, date, location, guest count, and budget. Takes just a few minutes.' },
              { icon: ChefHat,    step: '02', title: 'Chefs Apply',         desc: 'Verified chefs browse your listing and send proposals. Review profiles and choose the perfect fit.' },
              { icon: CreditCard, step: '03', title: 'Book & Pay Securely', desc: 'Funds are held in escrow and released only after you confirm a successful event.' },
            ].map((item) => (
              <div key={item.step} className="group relative bg-white rounded-2xl p-8 border hover:shadow-xl transition-all duration-300" style={{ borderColor: 'var(--border)' }}>
                {/* Large step number in bg */}
                <div className="absolute top-5 right-6 font-display text-[5rem] font-bold leading-none select-none pointer-events-none" style={{ color: 'var(--parchment)' }}>
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#C8892A]/10" style={{ background: 'var(--parchment)' }}>
                    <item.icon className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                  </div>
                  <h3 className="font-display text-2xl font-semibold mb-3" style={{ color: 'var(--ink)' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--warm-stone)' }}>{item.desc}</p>
                </div>
                {/* Bottom gold line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{ background: 'var(--gold)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CHEFS ───────────────────────── */}
      {featuredChefs && featuredChefs.length > 0 && (
        <section className="py-28" style={{ background: 'var(--parchment)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-14">
              <div className="flex items-start gap-5">
                <div className="w-10 h-px mt-4 shrink-0" style={{ background: 'var(--gold)' }} />
                <div>
                  <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light" style={{ color: 'var(--ink)' }}>
                    Featured Chefs
                  </h2>
                  <p className="mt-2" style={{ color: 'var(--warm-stone)' }}>Handpicked professionals, personally vetted by our team</p>
                </div>
              </div>
              <Link href="/chefs" className="hidden sm:flex items-center gap-1.5 text-sm font-medium transition-all hover:gap-2.5" style={{ color: 'var(--gold)' }}>
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredChefs.map((chef, i) => (
                <Link key={chef.id} href={`/chefs/${chef.id}`} className="group">
                  <div className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-up delay-${i * 150}`} style={{ borderColor: 'var(--border)' }}>
                    <div className="aspect-[4/3] relative overflow-hidden" style={{ background: 'var(--parchment)' }}>
                      {chef.portfolioImages?.[0] && !chef.portfolioImages[0].startsWith('blob:') ? (
                        <img
                          src={chef.portfolioImages[0]}
                          alt={`${chef.firstName}'s work`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ChefHat className="h-14 w-14" style={{ color: 'var(--muted)' }} />
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>
                          {chef.firstName} {chef.lastName}
                        </h3>
                        {chef.avgRating > 0 && (
                          <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--gold)' }}>
                            <Star className="h-3.5 w-3.5 fill-[#C8892A] stroke-[#C8892A]" />
                            {Number(chef.avgRating).toFixed(1)}
                          </div>
                        )}
                      </div>
                      <p className="text-xs mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--warm-stone)' }}>{chef.bio}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {chef.cuisineSpecialties?.slice(0, 3).map((c: string) => (
                          <span key={c} className="text-xs px-2.5 py-1 rounded-full border" style={{ background: '#C8892A10', color: 'var(--gold)', borderColor: '#C8892A30' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="sm:hidden mt-8 text-center">
              <Link href="/chefs" className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--gold)' }}>
                View all chefs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── WHY MYCHEF ───────────────────────────── */}
      <section className="py-28 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px" style={{ background: 'var(--gold)' }} />
                <span className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--gold)' }}>
                  Why Choose Us
                </span>
              </div>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light mb-10 leading-tight" style={{ color: 'var(--ink)' }}>
                A Platform Built on Trust
              </h2>
              <div className="space-y-7">
                {[
                  { title: 'Verified Professionals',  desc: 'Every chef is personally interviewed and reviewed before being listed on the platform.' },
                  { title: 'Secure Escrow Payments',   desc: 'Funds are held safely and released only after you confirm a successful event.' },
                  { title: 'Full Transparency',        desc: 'Real reviews, verified event counts, and complete chef profiles — no hidden surprises.' },
                  { title: 'Dispute Protection',       desc: 'Our admin team mediates any issues. Your satisfaction is our top priority.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 group">
                    <div className="mt-1 shrink-0">
                      <CheckCircle className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--ink)' }}>{item.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--warm-stone)' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield,     label: 'Vetted & Verified',   bg: '#EEF2FF', color: '#4F46E5' },
                { icon: CreditCard, label: 'Escrow Payments',     bg: '#ECFDF5', color: '#059669' },
                { icon: Star,       label: 'Verified Reviews',    bg: '#C8892A10', color: '#C8892A' },
                { icon: Users,      label: 'Dispute Support',     bg: '#FDF4FF', color: '#9333EA' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl p-7 border flex flex-col items-center gap-3 text-center hover:shadow-lg transition-shadow" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: item.bg }}>
                    <item.icon className="h-6 w-6" style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="relative py-32 bg-[#0C0907] overflow-hidden grain">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,_#3d1f0055,_transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="decor-line justify-center mb-8">
            Get Started
          </div>
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-light text-white mb-6 leading-tight">
            Ready to Elevate<br />
            <span className="italic" style={{ color: 'var(--gold-light)' }}>Your Event?</span>
          </h2>
          <p className="mb-12 text-lg max-w-md mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
            Join thousands of clients who&apos;ve found their perfect chef through MyChef.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-[#C8892A] hover:bg-[#A0621A] text-white font-medium tracking-wide min-w-[160px] border-0">
                Post an Event
              </Button>
            </Link>
            <Link href="/apply">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 min-w-[160px]">
                Join as a Chef
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
