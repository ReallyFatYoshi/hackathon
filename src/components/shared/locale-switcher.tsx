'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

const locales = [
  { code: 'en', label: 'EN' },
  { code: 'nl', label: 'NL' },
] as const

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchLocale(next: string) {
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className={cn('flex items-center rounded-full border border-stone-200 p-0.5 gap-0', className)}>
      {locales.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          disabled={isPending}
          className={cn(
            'px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-200',
            locale === code
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
