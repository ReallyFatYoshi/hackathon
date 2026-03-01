'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Download,
  Smartphone,
  Wifi,
  WifiOff,
  Bell,
  Zap,
  Globe,
  CheckCircle2,
  Monitor,
  Tablet,
  ArrowDown,
  Chrome,
  Apple,
} from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallAppPage() {
  const t = useTranslations('installApp')
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  const features = [
    { icon: Zap, title: t('features.fast'), desc: t('features.fastDesc') },
    { icon: WifiOff, title: t('features.offline'), desc: t('features.offlineDesc') },
    { icon: Bell, title: t('features.notifications'), desc: t('features.notificationsDesc') },
    { icon: Smartphone, title: t('features.native'), desc: t('features.nativeDesc') },
    { icon: Globe, title: t('features.crossPlatform'), desc: t('features.crossPlatformDesc') },
    { icon: Wifi, title: t('features.autoUpdate'), desc: t('features.autoUpdateDesc') },
  ]

  const platforms = [
    {
      icon: Chrome,
      name: t('platforms.chrome'),
      steps: [t('platforms.chromeStep1'), t('platforms.chromeStep2'), t('platforms.chromeStep3')],
    },
    {
      icon: Apple,
      name: t('platforms.safari'),
      steps: [t('platforms.safariStep1'), t('platforms.safariStep2'), t('platforms.safariStep3')],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <div
        className="relative rounded-2xl border overflow-hidden px-8 py-10 text-center"
        style={{
          borderColor: 'var(--border)',
          background: 'linear-gradient(135deg, #C8892A08 0%, white 40%, #C8892A05 100%)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #C8892A 0%, #E8B86A 50%, #C8892A 100%)' }}
        />

        <div
          className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #C8892A 0%, #E8B86A 100%)',
            boxShadow: '0 8px 32px #C8892A30',
          }}
        >
          <Download className="h-9 w-9 text-white" />
        </div>

        <h1
          className="font-display text-3xl font-semibold mb-2"
          style={{ color: 'var(--ink)' }}
        >
          {t('title')}
        </h1>
        <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'var(--muted)' }}>
          {t('subtitle')}
        </p>

        {/* Install state */}
        {isStandalone || installed ? (
          <div
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold"
            style={{ background: '#16a34a12', color: '#16a34a', border: '1px solid #16a34a25' }}
          >
            <CheckCircle2 className="h-5 w-5" />
            {t('alreadyInstalled')}
          </div>
        ) : prompt ? (
          <button
            onClick={handleInstall}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #C8892A 0%, #E8B86A 100%)',
              boxShadow: '0 4px 20px #C8892A40',
            }}
          >
            <Download className="h-5 w-5" />
            {t('installNow')}
          </button>
        ) : (
          <div className="space-y-3">
            <div
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'var(--parchment)', color: 'var(--warm-stone)' }}
            >
              <ArrowDown className="h-4 w-4" />
              {t('manualInstall')}
            </div>
          </div>
        )}

        {/* Device icons */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { Icon: Smartphone, label: t('devices.phone') },
            { Icon: Tablet, label: t('devices.tablet') },
            { Icon: Monitor, label: t('devices.desktop') },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <Icon className="h-5 w-5" style={{ color: '#C8892A' }} />
              <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--ink)' }}>
          {t('whyInstall')}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border p-4 transition-all hover:border-[#C8892A40] hover:shadow-sm"
              style={{ borderColor: 'var(--border)', background: 'white' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: '#C8892A10' }}
              >
                <f.icon className="h-4.5 w-4.5" style={{ color: '#C8892A' }} />
              </div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--ink)' }}>
                {f.title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual install instructions */}
      {!isStandalone && !installed && !prompt && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--ink)' }}>
            {t('howToInstall')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {platforms.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'white' }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <p.icon className="h-5 w-5" style={{ color: 'var(--ink)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                    {p.name}
                  </p>
                </div>
                <ol className="space-y-2.5">
                  {p.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5"
                        style={{ background: '#C8892A15', color: '#C8892A' }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--warm-stone)' }}>
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
