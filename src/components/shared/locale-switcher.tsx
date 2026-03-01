'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { routing } from '@/i18n/routing'

const localeLabels: Record<string, string> = { en: 'EN', nl: 'NL' }

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function switchLocale(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next as any })
    })
  }

  return (
    <div className={cn('flex items-center rounded-full border border-stone-200 p-0.5 gap-0', className)}>
      {routing.locales.map((code) => (
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
          {localeLabels[code] ?? code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
