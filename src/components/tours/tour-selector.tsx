'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useTour } from './tour-provider'
import {
  HelpCircle,
  X,
  Play,
  Compass,
  Home,
  ChefHat,
  Calendar,
  MessageSquare,
  User,
  Shield,
  Download,
  BookOpen,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Home,
  ChefHat,
  Calendar,
  MessageSquare,
  User,
  Shield,
  Download,
  BookOpen,
}

export function TourSelector() {
  const [open, setOpen] = useState(false)
  const { startTour, isRunning, availableTours } = useTour()
  const t = useTranslations('tours')

  if (isRunning) return null

  async function handleStart(tourId: string) {
    setOpen(false)
    // Small delay so the panel closes before tour starts
    await new Promise((r) => setTimeout(r, 200))
    startTour(tourId)
  }

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setOpen(!open)}
        data-tour="help-button"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #C8892A 0%, #E8B86A 100%)',
          boxShadow: '0 4px 20px rgba(200, 137, 42, 0.4)',
        }}
        aria-label="Tours"
      >
        <HelpCircle className="h-5 w-5 text-white" />
      </button>

      {/* Tour selection panel */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed bottom-20 right-6 z-50 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300"
            style={{
              background: 'white',
              borderColor: '#E8E0D4',
              boxShadow: '0 8px 40px rgba(12, 9, 7, 0.15), 0 2px 8px rgba(12, 9, 7, 0.08)',
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 flex items-center justify-between px-5 py-4 border-b"
              style={{
                background: 'linear-gradient(135deg, #FAF8F5 0%, white 100%)',
                borderColor: '#E8E0D4',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#C8892A12' }}
                >
                  <Compass className="h-4 w-4" style={{ color: '#C8892A' }} />
                </div>
                <div>
                  <h3
                    className="font-display text-sm font-semibold"
                    style={{ color: '#0C0907' }}
                  >
                    {t('selectorTitle')}
                  </h3>
                  <p className="text-[11px]" style={{ color: '#8A7968' }}>
                    {t('selectorDesc')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                style={{ color: '#8A7968' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tour list */}
            <div className="p-2">
              {availableTours.map((tour) => {
                const Icon = ICON_MAP[tour.icon] || Compass
                const idPrefix = tour.id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
                return (
                  <button
                    key={tour.id}
                    onClick={() => handleStart(tour.id)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all hover:bg-stone-50 group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors group-hover:bg-[#C8892A15]"
                      style={{ background: '#FAF8F5' }}
                    >
                      <Icon
                        className="h-4 w-4 transition-colors text-[#8A7968]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: '#0C0907' }}
                      >
                        {safeT(t, `${idPrefix}.title`)}
                      </p>
                      <p
                        className="text-xs mt-0.5 line-clamp-2"
                        style={{ color: '#8A7968' }}
                      >
                        {safeT(t, `${idPrefix}.desc`)}
                      </p>
                    </div>
                    <Play
                      className="h-3.5 w-3.5 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#C8892A' }}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}

function safeT(t: any, key: string): string {
  try {
    return t(key)
  } catch {
    return key
  }
}
