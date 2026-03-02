'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { authClient, useSession } from '@/lib/auth-client'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import {
  ShieldCheck,
  ShieldOff,
  Copy,
  Check,
  ArrowLeft,
  Smartphone,
  KeyRound,
  Monitor,
  Fingerprint,
  Trash2,
  Plus,
  Bell,
  BellOff,
  Loader2,
} from 'lucide-react'

type Step = 'overview' | 'enable-password' | 'enable-qr' | 'enable-verify' | 'backup-codes' | 'disable'

interface PasskeyInfo {
  id: string
  name: string | null
  createdAt: Date | string | null
}

export default function SecuritySettingsPage() {
  const t = useTranslations('security')
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<Step>('overview')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [totpUri, setTotpUri] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verifyCode, setVerifyCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([])
  const [passkeyLoading, setPasskeyLoading] = useState(false)

  const is2FAEnabled = session?.user?.twoFactorEnabled

  async function loadPasskeys() {
    const { data } = await authClient.passkey.listUserPasskeys()
    if (data) setPasskeys(data as PasskeyInfo[])
  }

  useEffect(() => {
    loadPasskeys()
  }, [])

  async function handleAddPasskey() {
    setPasskeyLoading(true)
    try {
      const { error } = await authClient.passkey.addPasskey()
      if (error) {
        toast({ title: t('passkeyAddFailed'), description: error.message, variant: 'error' })
      } else {
        toast({ title: t('passkeyAdded'), variant: 'success' })
        await loadPasskeys()
      }
    } catch {
      toast({ title: t('passkeyAddFailed'), variant: 'error' })
    }
    setPasskeyLoading(false)
  }

  async function handleDeletePasskey(id: string) {
    const { error } = await authClient.passkey.deletePasskey({ id })
    if (error) {
      toast({ title: t('passkeyDeleteFailed'), description: error.message, variant: 'error' })
    } else {
      toast({ title: t('passkeyDeleted'), variant: 'success' })
      setPasskeys((prev) => prev.filter((p) => p.id !== id))
    }
  }

  async function handleEnable() {
    if (!password) {
      toast({ title: t('enterPassword'), variant: 'error' })
      return
    }
    setLoading(true)
    try {
      const { data, error } = await authClient.twoFactor.enable({ password })
      if (error) {
        toast({ title: t('enableFailed'), description: error.message, variant: 'error' })
        setLoading(false)
        return
      }
      setTotpUri(data?.totpURI || '')
      setBackupCodes(data?.backupCodes || [])
      setStep('enable-qr')
    } catch {
      toast({ title: t('enableFailed'), variant: 'error' })
    }
    setLoading(false)
  }

  async function handleVerifySetup() {
    if (verifyCode.length !== 6) {
      toast({ title: t('enterFullCode'), variant: 'error' })
      return
    }
    setLoading(true)
    const { error } = await authClient.twoFactor.verifyTotp({ code: verifyCode })
    if (error) {
      toast({ title: t('verificationFailed'), description: error.message, variant: 'error' })
      setLoading(false)
      return
    }
    toast({ title: t('twoFAEnabled'), variant: 'success' })
    setStep('backup-codes')
    setLoading(false)
  }

  async function handleDisable() {
    if (!password) {
      toast({ title: t('enterPassword'), variant: 'error' })
      return
    }
    setLoading(true)
    const { error } = await authClient.twoFactor.disable({ password })
    if (error) {
      toast({ title: t('disableFailed'), description: error.message, variant: 'error' })
      setLoading(false)
      return
    }
    toast({ title: t('twoFADisabled'), variant: 'success' })
    setStep('overview')
    setPassword('')
    setLoading(false)
    router.refresh()
  }

  async function handleRegenerateBackup() {
    if (!password) {
      toast({ title: t('enterPassword'), variant: 'error' })
      return
    }
    setLoading(true)
    const { data, error } = await authClient.twoFactor.generateBackupCodes({ password })
    if (error) {
      toast({ title: t('regenerateFailed'), description: error.message, variant: 'error' })
      setLoading(false)
      return
    }
    setBackupCodes(data?.backupCodes || [])
    setStep('backup-codes')
    setLoading(false)
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    setCopied(true)
    toast({ title: t('copiedToClipboard'), variant: 'success' })
    setTimeout(() => setCopied(false), 2000)
  }

  function resetState() {
    setStep('overview')
    setPassword('')
    setTotpUri('')
    setBackupCodes([])
    setVerifyCode('')
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => step === 'overview' ? router.back() : resetState()}
          className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          style={{ color: 'var(--warm-stone)' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
            {t('title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('subtitle')}</p>
        </div>
      </div>

      {/* Overview */}
      {step === 'overview' && (
        <div className="space-y-4">
          {/* 2FA Status Card */}
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: 'var(--border)', background: 'white' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: is2FAEnabled
                      ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                      : 'linear-gradient(135deg, #C8892A20, #E8C47A15)',
                    border: is2FAEnabled ? 'none' : '1px solid #C8892A30',
                  }}
                >
                  {is2FAEnabled ? (
                    <ShieldCheck className="w-6 h-6 text-white" />
                  ) : (
                    <ShieldOff className="w-6 h-6" style={{ color: 'var(--gold)' }} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-base" style={{ color: 'var(--ink)' }}>
                    {t('twoFactorAuth')}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--warm-stone)' }}>
                    {is2FAEnabled ? t('twoFAActiveDesc') : t('twoFAInactiveDesc')}
                  </p>
                </div>
              </div>
              <span
                className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full shrink-0"
                style={{
                  background: is2FAEnabled ? '#05966915' : '#DC262615',
                  color: is2FAEnabled ? '#059669' : '#DC2626',
                }}
              >
                {is2FAEnabled ? t('active') : t('inactive')}
              </span>
            </div>

            <div className="mt-5 pt-5 border-t flex flex-wrap gap-3" style={{ borderColor: 'var(--border)' }}>
              {is2FAEnabled ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('disable')}
                  >
                    <ShieldOff className="w-4 h-4" />
                    {t('disable2FA')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setStep('disable'); /* Will show password then regen */ }}
                  >
                    <KeyRound className="w-4 h-4" />
                    {t('regenerateBackupCodes')}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="bg-[#0C0907] hover:bg-[#1A1208] text-white border-0"
                  onClick={() => setStep('enable-password')}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t('enable2FA')}
                </Button>
              )}
            </div>
          </div>

          {/* Sessions Card */}
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: 'var(--border)', background: 'white' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #C8892A20, #E8C47A15)', border: '1px solid #C8892A30' }}
              >
                <Monitor className="w-6 h-6" style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-base" style={{ color: 'var(--ink)' }}>
                  {t('activeSessions')}
                </h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--warm-stone)' }}>
                  {t('activeSessionsDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Passkeys Card */}
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: 'var(--border)', background: 'white' }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C8892A20, #E8C47A15)', border: '1px solid #C8892A30' }}
                >
                  <Fingerprint className="w-6 h-6" style={{ color: 'var(--gold)' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-base" style={{ color: 'var(--ink)' }}>
                    {t('passkeys')}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--warm-stone)' }}>
                    {t('passkeysDesc')}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-[#0C0907] hover:bg-[#1A1208] text-white border-0 shrink-0"
                onClick={handleAddPasskey}
                loading={passkeyLoading}
              >
                <Plus className="w-4 h-4" />
                {t('addPasskey')}
              </Button>
            </div>

            {passkeys.length > 0 ? (
              <div className="space-y-2">
                {passkeys.map((pk) => (
                  <div
                    key={pk.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border"
                    style={{ borderColor: 'var(--border)', background: '#FAFAF9' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Fingerprint className="w-5 h-5 shrink-0" style={{ color: 'var(--gold)' }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>
                          {pk.name || t('unnamedPasskey')}
                        </p>
                        {pk.createdAt && (
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {t('addedOn')} {new Date(pk.createdAt as string | number).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePasskey(pk.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500 shrink-0"
                      title={t('deletePasskey')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-6 rounded-xl border border-dashed"
                style={{ borderColor: 'var(--border)' }}
              >
                <Fingerprint className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted)' }} />
                <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>
                  {t('noPasskeys')}
                </p>
              </div>
            )}
          </div>

          {/* Push Notifications Card */}
          <PushNotificationCard />
        </div>
      )}

      {/* Enable Step 1: Enter Password */}
      {step === 'enable-password' && (
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: 'var(--border)', background: 'white' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#C8892A15' }}
            >
              <Smartphone className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>{t('setupTwoFA')}</h3>
              <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('confirmIdentity')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label={t('currentPassword')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetState} className="flex-1">
                {t('cancel')}
              </Button>
              <Button
                className="flex-1 bg-[#0C0907] hover:bg-[#1A1208] text-white border-0"
                onClick={handleEnable}
                loading={loading}
              >
                {t('continue')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enable Step 2: Show QR Code */}
      {step === 'enable-qr' && (
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: 'var(--border)', background: 'white' }}
        >
          <div className="text-center mb-6">
            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--ink)' }}>
              {t('scanQRCode')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>
              {t('scanQRDesc')}
            </p>
          </div>

          {/* QR Code display using totp URI */}
          <div className="flex justify-center mb-6">
            <div
              className="p-4 rounded-2xl border-2"
              style={{ borderColor: 'var(--border)', background: '#FAFAF9' }}
            >
              {/* Use an img tag with a QR code API */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
                alt="TOTP QR Code"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Manual entry URI */}
          <div className="mb-6">
            <p className="text-xs text-center mb-2" style={{ color: 'var(--warm-stone)' }}>
              {t('cantScan')}
            </p>
            <div
              className="px-3 py-2 rounded-lg text-xs font-mono break-all text-center"
              style={{ background: '#F5F5F4', color: 'var(--warm-stone)' }}
            >
              {totpUri}
            </div>
          </div>

          <Button
            className="w-full bg-[#0C0907] hover:bg-[#1A1208] text-white border-0"
            onClick={() => setStep('enable-verify')}
          >
            {t('iScannedIt')}
          </Button>
        </div>
      )}

      {/* Enable Step 3: Verify code */}
      {step === 'enable-verify' && (
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: 'var(--border)', background: 'white' }}
        >
          <div className="text-center mb-6">
            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--ink)' }}>
              {t('enterVerificationCode')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>
              {t('enterCodeFromApp')}
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.3em] font-mono"
              autoFocus
            />
            <Button
              className="w-full bg-[#0C0907] hover:bg-[#1A1208] text-white border-0"
              onClick={handleVerifySetup}
              loading={loading}
            >
              {t('verifyAndEnable')}
            </Button>
          </div>
        </div>
      )}

      {/* Backup Codes Display */}
      {step === 'backup-codes' && (
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: 'var(--border)', background: 'white' }}
        >
          <div className="text-center mb-6">
            <div
              className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)' }}
            >
              <Check className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--ink)' }}>
              {t('saveBackupCodes')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>
              {t('backupCodesDesc')}
            </p>
          </div>

          <div
            className="grid grid-cols-2 gap-2 p-4 rounded-xl mb-4"
            style={{ background: '#FAFAF9', border: '1px solid var(--border)' }}
          >
            {backupCodes.map((code, i) => (
              <div
                key={i}
                className="px-3 py-2 rounded-lg text-sm font-mono text-center"
                style={{ background: 'white', color: 'var(--ink)', border: '1px solid var(--border)' }}
              >
                {code}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={copyBackupCodes}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('copied') : t('copyAll')}
            </Button>
            <Button
              className="flex-1 bg-[#0C0907] hover:bg-[#1A1208] text-white border-0"
              onClick={resetState}
            >
              {t('done')}
            </Button>
          </div>
        </div>
      )}

      {/* Disable 2FA */}
      {step === 'disable' && (
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: 'var(--border)', background: 'white' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#DC262615' }}
            >
              <ShieldOff className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>{t('disableTwoFA')}</h3>
              <p className="text-sm" style={{ color: 'var(--warm-stone)' }}>{t('disableWarning')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label={t('currentPassword')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetState} className="flex-1">
                {t('cancel')}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDisable}
                loading={loading}
              >
                {t('confirmDisable')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PushNotificationCard() {
  const t = useTranslations('security')
  const { status, subscribe, unsubscribe } = usePushNotifications()
  const [loading, setLoading] = useState(false)

  const isSubscribed = status === 'subscribed'
  const isUnsupported = status === 'unsupported'
  const isDenied = status === 'denied'

  async function handleToggle() {
    setLoading(true)
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
    setLoading(false)
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{ borderColor: 'var(--border)', background: 'white' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: isSubscribed
                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #C8892A20, #E8C47A15)',
              border: isSubscribed ? 'none' : '1px solid #C8892A30',
            }}
          >
            {isSubscribed ? (
              <Bell className="w-6 h-6 text-white" />
            ) : (
              <BellOff className="w-6 h-6" style={{ color: 'var(--gold)' }} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--ink)' }}>
              {t('pushNotifications')}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--warm-stone)' }}>
              {isUnsupported
                ? t('pushUnsupported')
                : isDenied
                  ? t('pushDenied')
                  : isSubscribed
                    ? t('pushEnabledDesc')
                    : t('pushDisabledDesc')}
            </p>
          </div>
        </div>
        <span
          className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full shrink-0"
          style={{
            background: isSubscribed ? '#05966915' : '#DC262615',
            color: isSubscribed ? '#059669' : '#DC2626',
          }}
        >
          {isSubscribed ? t('active') : t('inactive')}
        </span>
      </div>

      {!isUnsupported && !isDenied && (
        <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <Button
            size="sm"
            variant={isSubscribed ? 'outline' : 'default'}
            className={isSubscribed ? '' : 'bg-[#0C0907] hover:bg-[#1A1208] text-white border-0'}
            onClick={handleToggle}
            disabled={loading || status === 'loading'}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSubscribed ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {isSubscribed ? t('disablePush') : t('enablePush')}
          </Button>
        </div>
      )}
    </div>
  )
}
