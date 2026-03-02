'use client'

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { tours, getToursForRole, type TourDefinition } from '@/lib/tours'

interface TourContextValue {
  startTour: (tourId: string) => Promise<void>
  isRunning: boolean
  availableTours: TourDefinition[]
}

const TourContext = createContext<TourContextValue>({
  startTour: async () => {},
  isRunning: false,
  availableTours: [],
})

export const useTour = () => useContext(TourContext)

interface TourProviderProps {
  children: ReactNode
  role: 'client' | 'chef' | 'admin'
  locale: string
}

export function TourProvider({ children, role, locale }: TourProviderProps) {
  const t = useTranslations('tours')
  const router = useRouter()
  const pathname = usePathname()
  const tgRef = useRef<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const availableTours = getToursForRole(role)

  const startTour = useCallback(
    async (tourId: string) => {
      const tourDef = tours.find((t) => t.id === tourId)
      if (!tourDef) return

      // Navigate to start path if needed
      if (tourDef.startPath) {
        const fullPath = `/${locale}${tourDef.startPath}`
        if (pathname !== fullPath) {
          router.push(fullPath)
          // Wait for navigation
          await new Promise((r) => setTimeout(r, 800))
        }
      }

      // Dynamically import TourGuideClient
      const mod = await import('@sjmc11/tourguidejs/dist/tour.js')
      const TourGuideClient = mod.TourGuideClient || mod.default

      // Destroy previous instance
      if (tgRef.current) {
        try { await tgRef.current.exit() } catch {}
        tgRef.current = null
      }

      // Translate step content using the tour-specific keys
      const idPrefix = tourId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      const translatedSteps = tourDef.steps.map((step, i) => ({
        ...step,
        title: safeT(t, `${idPrefix}.step${i}Title`),
        content: safeT(t, `${idPrefix}.step${i}Content`),
      }))

      // Filter out steps whose target doesn't exist in the DOM
      const validSteps = translatedSteps.filter((step) => {
        if (!step.target || typeof step.target !== 'string') return true
        return document.querySelector(step.target) !== null
      })

      if (validSteps.length === 0) return

      const tg = new TourGuideClient({
        steps: validSteps,
        autoScroll: true,
        autoScrollSmooth: true,
        dialogAnimate: true,
        backdropAnimate: true,
        backdropColor: 'rgba(12, 9, 7, 0.55)',
        targetPadding: 12,
        nextLabel: safeT(t, 'next'),
        prevLabel: safeT(t, 'prev'),
        finishLabel: safeT(t, 'finish'),
        showStepDots: true,
        showStepProgress: true,
        closeButton: true,
        completeOnFinish: true,
        exitOnEscape: true,
        exitOnClickOutside: false,
        keyboardControls: true,
        dialogMaxWidth: 380,
      })

      tgRef.current = tg

      tg.onFinish(() => setIsRunning(false))
      tg.onAfterExit(() => setIsRunning(false))

      setIsRunning(true)
      await tg.start()
    },
    [t, pathname, router, locale]
  )

  return (
    <TourContext.Provider value={{ startTour, isRunning, availableTours }}>
      {children}
    </TourContext.Provider>
  )
}

/** Safely access a nested translation key, returning the key name as fallback */
function safeT(t: any, key: string): string {
  try {
    return t(key)
  } catch {
    return key
  }
}
