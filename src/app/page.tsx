import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  // Fetch a few featured chefs
  const { data: featuredChefs } = await supabase
    .from('chefs')
    .select('id, first_name, last_name, bio, cuisine_specialties, portfolio_images, avg_rating, total_events')
    .eq('is_visible', true)
    .order('avg_rating', { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#f59e0b,_transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-amber-500/30">
              <Shield className="h-4 w-4" />
              Verified Professional Chefs Only
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Exceptional Culinary<br />
              <span className="text-amber-400">Experiences,</span> Delivered.
            </h1>
            <p className="text-lg md:text-xl text-stone-300 mb-10 max-w-xl leading-relaxed">
              MyChef connects you with verified professional chefs for weddings, corporate events, private dinners, and more. Every chef is personally vetted and interviewed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/chefs">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold w-full sm:w-auto">
                  Find a Chef
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link href="/apply">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                  Apply as a Chef
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Verified Chefs', value: '200+' },
              { label: 'Events Catered', value: '1,500+' },
              { label: 'Happy Clients', value: '900+' },
              { label: 'Avg. Rating', value: '4.9★' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-amber-600">{stat.value}</div>
                <div className="text-sm text-stone-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-4">
              How MyChef Works
            </h2>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">
              A seamless process from posting your event to enjoying a world-class culinary experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                step: '01',
                title: 'Post Your Event',
                desc: 'Describe your event, date, location, guest count, and budget. It only takes minutes.',
              },
              {
                icon: ChefHat,
                step: '02',
                title: 'Chefs Apply',
                desc: 'Verified chefs browse your listing and send proposals. You review profiles and choose the best fit.',
              },
              {
                icon: CreditCard,
                step: '03',
                title: 'Book & Pay Securely',
                desc: 'Pay upfront — funds are held in escrow. Chefs get paid only after you confirm the event was a success.',
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-8 shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
                <div className="text-5xl font-black text-stone-100 absolute top-6 right-6">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Chefs */}
      {featuredChefs && featuredChefs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-2">
                  Featured Chefs
                </h2>
                <p className="text-stone-500">Handpicked professionals vetted by our team</p>
              </div>
              <Link href="/chefs" className="text-amber-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredChefs.map((chef) => (
                <Link key={chef.id} href={`/chefs/${chef.id}`} className="group">
                  <div className="bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 hover:shadow-lg transition-all group-hover:border-amber-200">
                    <div className="aspect-[4/3] bg-gradient-to-br from-stone-200 to-stone-300 relative overflow-hidden">
                      {chef.portfolio_images?.[0] ? (
                        <img
                          src={chef.portfolio_images[0]}
                          alt={`${chef.first_name}'s work`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ChefHat className="h-16 w-16 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-stone-900">
                          {chef.first_name} {chef.last_name}
                        </h3>
                        {chef.avg_rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-amber-600 font-semibold">
                            <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                            {Number(chef.avg_rating).toFixed(1)}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mb-3 line-clamp-2">{chef.bio}</p>
                      <div className="flex flex-wrap gap-1">
                        {chef.cuisine_specialties?.slice(0, 3).map((c: string) => (
                          <span key={c} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-100">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why MyChef */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-6">
                Why Choose MyChef?
              </h2>
              <div className="space-y-5">
                {[
                  { title: 'Verified Professionals', desc: 'Every chef is personally interviewed by our team before being listed on the platform.' },
                  { title: 'Secure Payments', desc: 'Funds are held in escrow and released only after you confirm a successful event.' },
                  { title: 'Full Transparency', desc: 'Real reviews, verified event counts, and complete chef profiles — no hidden surprises.' },
                  { title: 'Dispute Protection', desc: 'Our admin team mediates any issues. Your satisfaction is our top priority.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <CheckCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-stone-900">{item.title}</h4>
                      <p className="text-sm text-stone-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'Vetted & Verified', color: 'bg-blue-50 text-blue-600' },
                { icon: CreditCard, label: 'Escrow Payments', color: 'bg-emerald-50 text-emerald-600' },
                { icon: Star, label: 'Verified Reviews', color: 'bg-amber-50 text-amber-600' },
                { icon: Users, label: 'Dispute Support', color: 'bg-purple-50 text-purple-600' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl p-6 border border-stone-200 flex flex-col items-center gap-3 text-center shadow-sm">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-stone-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to Elevate Your Event?
          </h2>
          <p className="text-amber-100 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of clients who've found their perfect chef through MyChef.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50 font-bold w-full sm:w-auto">
                Post an Event
              </Button>
            </Link>
            <Link href="/apply">
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 w-full sm:w-auto">
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
