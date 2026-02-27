import { ChefHat } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="h-6 w-6 text-amber-600" />
              <span className="text-lg font-bold text-stone-900">MyChef</span>
            </div>
            <p className="text-sm text-stone-500 max-w-xs">
              Connecting institutions and individuals with verified professional chefs for catering and event services.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><Link href="/chefs" className="hover:text-stone-700">Find a Chef</Link></li>
              <li><Link href="/events" className="hover:text-stone-700">Browse Events</Link></li>
              <li><Link href="/apply" className="hover:text-stone-700">Become a Chef</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900 mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><Link href="/register" className="hover:text-stone-700">Sign Up</Link></li>
              <li><Link href="/login" className="hover:text-stone-700">Sign In</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-stone-200 text-xs text-stone-400 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} MyChef. All rights reserved.</p>
          <p>Platform fee: 15% on completed bookings</p>
        </div>
      </div>
    </footer>
  )
}
