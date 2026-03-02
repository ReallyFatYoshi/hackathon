'use client'

import { useRef, useCallback, useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'

const SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

/**
 * Hook for hCaptcha integration with better-auth.
 * Returns the HCaptcha component, a getter for the current token,
 * and a reset function. When NEXT_PUBLIC_HCAPTCHA_SITE_KEY is not set,
 * the captcha is disabled and getToken() returns undefined.
 */
export function useHCaptcha() {
  const captchaRef = useRef<HCaptcha>(null)
  const [token, setToken] = useState<string | undefined>()

  const onVerify = useCallback((t: string) => setToken(t), [])
  const onExpire = useCallback(() => setToken(undefined), [])

  const reset = useCallback(() => {
    setToken(undefined)
    captchaRef.current?.resetCaptcha()
  }, [])

  const getToken = useCallback(() => token, [token])

  const enabled = !!SITE_KEY

  function CaptchaWidget({ className }: { className?: string }) {
    if (!enabled) return null
    return (
      <div className={className}>
        <HCaptcha
          ref={captchaRef}
          sitekey={SITE_KEY!}
          onVerify={onVerify}
          onExpire={onExpire}
        />
      </div>
    )
  }

  return { CaptchaWidget, getToken, reset, enabled }
}
