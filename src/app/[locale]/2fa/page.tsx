'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { ShieldCheck, KeyRound } from 'lucide-react'

type Mode = 'totp' | 'backup'

export default function TwoFactorPage() {
  const t = useTranslations('twoFactor')
  const [mode, setMode] = useState<Mode>('totp')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [backupCode, setBackupCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [trustDevice, setTrustDevice] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [mode])

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...code]
    next[index] = value.slice(-1)
    setCode(next)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...code]
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || ''
    }
    setCode(next)
    const focusIdx = Math.min(pasted.length, 5)
    inputRefs.current[focusIdx]?.focus()
  }

  async function handleVerifyTotp(e: React.FormEvent) {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      toast({ title: t('enterFullCode'), variant: 'error' })
      return
    }
    setLoading(true)
    const { error } = await authClient.twoFactor.verifyTotp({
      code: fullCode,
      trustDevice,
    })
    if (error) {
      toast({ title: t('verificationFailed'), description: error.message, variant: 'error' })
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleVerifyBackup(e: React.FormEvent) {
    e.preventDefault()
    if (!backupCode.trim()) {
      toast({ title: t('enterBackupCode'), variant: 'error' })
      return
    }
    setLoading(true)
    const { error } = await authClient.twoFactor.verifyBackupCode({
      code: backupCode.trim(),
      trustDevice,
    })
    if (error) {
      toast({ title: t('verificationFailed'), description: error.message, variant: 'error' })
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--canvas)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, #C8892A20, #E8C47A15)', border: '1px solid #C8892A30' }}
          >
            <ShieldCheck className="w-8 h-8" style={{ color: 'var(--gold)' }} />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
            {t('title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>
            {mode === 'totp' ? t('totpSubtitle') : t('backupSubtitle')}
          </p>
        </div>

        {/* TOTP Mode */}
        {mode === 'totp' && (
          <form onSubmit={handleVerifyTotp} className="space-y-6">
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all focus:outline-none"
                  style={{
                    borderColor: digit ? 'var(--gold)' : 'var(--border)',
                    background: 'var(--canvas)',
                    color: 'var(--ink)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px #C8892A20' }}
                  onBlur={(e) => { e.target.style.borderColor = digit ? 'var(--gold)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              ))}
            </div>

            <label className="flex items-center gap-2 justify-center text-sm cursor-pointer" style={{ color: 'var(--warm-stone)' }}>
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="rounded accent-amber-600"
              />
              {t('trustDevice')}
            </label>

            <Button
              type="submit"
              className="w-full bg-[#0C0907] hover:bg-[#1A1208] text-white border-0"
              size="lg"
              loading={loading}
            >
              {t('verify')}
            </Button>
          </form>
        )}

        {/* Backup Code Mode */}
        {mode === 'backup' && (
          <form onSubmit={handleVerifyBackup} className="space-y-6">
            <div>
              <input
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                placeholder={t('backupPlaceholder')}
                className="w-full h-14 text-center text-lg font-mono rounded-xl border-2 transition-all focus:outline-none"
                style={{ borderColor: 'var(--border)', background: 'var(--canvas)', color: 'var(--ink)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px #C8892A20' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                autoFocus
              />
            </div>

            <label className="flex items-center gap-2 justify-center text-sm cursor-pointer" style={{ color: 'var(--warm-stone)' }}>
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="rounded accent-amber-600"
              />
              {t('trustDevice')}
            </label>

            <Button
              type="submit"
              className="w-full bg-[#0C0907] hover:bg-[#1A1208] text-white border-0"
              size="lg"
              loading={loading}
            >
              {t('verifyBackup')}
            </Button>
          </form>
        )}

        {/* Toggle mode */}
        <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => { setMode(mode === 'totp' ? 'backup' : 'totp'); setLoading(false) }}
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: 'var(--gold)' }}
          >
            <KeyRound className="w-4 h-4" />
            {mode === 'totp' ? t('useBackupCode') : t('useAuthenticator')}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm hover:underline" style={{ color: 'var(--warm-stone)' }}>
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  )
}
