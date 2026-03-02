'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Home, RotateCcw, AlertTriangle } from 'lucide-react'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errorPages')

  useEffect(() => {
    console.error('[MyChef Error]', error)
  }, [error])

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-3deg); }
          40% { transform: rotate(3deg); }
          60% { transform: rotate(-2deg); }
          80% { transform: rotate(1deg); }
        }
        @keyframes errorReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .error-page-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .error-page-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 50% 40% at 50% 50%, #C8892A06 0%, transparent 70%);
          pointer-events: none;
        }
        .err-card {
          position: relative;
          text-align: center;
          padding: 4rem 3rem;
          animation: errorReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .err-icon-ring {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          margin: 0 auto 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1.5px solid var(--border);
          box-shadow: 0 4px 24px #0C090706;
        }
        .err-icon-ring svg {
          animation: shake 0.6s ease-in-out 0.3s both;
        }
      `}</style>

      <div className="error-page-wrap">
        <div className="err-card">
          <div className="err-icon-ring">
            <AlertTriangle className="h-12 w-12" style={{ color: 'var(--gold)' }} />
          </div>

          <p
            className="font-display text-[4.5rem] leading-none font-light tracking-wider mb-2"
            style={{ color: '#C8892A40' }}
          >
            500
          </p>

          <h1
            className="font-display text-2xl font-semibold mb-2"
            style={{ color: 'var(--ink)' }}
          >
            {t('500title')}
          </h1>

          <div
            className="w-12 h-px mx-auto my-4"
            style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}
          />

          <p
            className="text-sm max-w-sm mx-auto mb-8 leading-relaxed"
            style={{ color: 'var(--warm-stone)' }}
          >
            {t('500desc')}
          </p>

          {error.digest && (
            <p className="text-xs mb-6 font-mono" style={{ color: 'var(--muted)' }}>
              {t('errorId')}: {error.digest}
            </p>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--ink)' }}
            >
              <RotateCcw className="h-4 w-4" />
              {t('tryAgain')}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] border"
              style={{ borderColor: 'var(--border)', color: 'var(--warm-stone)' }}
            >
              <Home className="h-4 w-4" />
              {t('backHome')}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
