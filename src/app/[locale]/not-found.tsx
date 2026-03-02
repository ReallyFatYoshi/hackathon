import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Home, UtensilsCrossed } from 'lucide-react'

export default async function LocaleNotFound() {
  let t: (key: string) => string
  try {
    const translations = await getTranslations('errorPages')
    t = (key: string) => translations(key)
  } catch {
    t = (key: string) => {
      const fallback: Record<string, string> = {
        '404title': 'Dish not found',
        '404desc': 'We couldn\'t find what you were looking for. The page may have been moved or no longer exists.',
        'backHome': 'Back to Home',
      }
      return fallback[key] ?? key
    }
  }

  return (
    <>
      <style>{`
        @keyframes plate-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reveal {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .not-found-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .not-found-wrap::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -20%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, #C8892A06 0%, transparent 70%);
          pointer-events: none;
        }
        .not-found-wrap::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, #C8892A04 0%, transparent 70%);
          pointer-events: none;
        }
        .nf-card {
          position: relative;
          text-align: center;
          padding: 4rem 3rem;
          animation: reveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .nf-plate {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          margin: 0 auto 2rem;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nf-plate-outer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          animation: plate-spin 40s linear infinite;
        }
        .nf-plate-outer::before {
          content: '';
          position: absolute;
          top: -3px;
          left: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
          transform: translateX(-50%);
        }
        .nf-plate-inner {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: white;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 12px #0C090704;
        }
      `}</style>

      <div className="not-found-wrap">
        <div className="nf-card">
          <div className="nf-plate">
            <div className="nf-plate-outer" />
            <div className="nf-plate-inner">
              <UtensilsCrossed className="h-10 w-10" style={{ color: 'var(--muted)' }} />
            </div>
          </div>

          <p
            className="font-display text-[5rem] leading-none font-light tracking-wider mb-2"
            style={{ color: 'var(--gold)' }}
          >
            404
          </p>

          <h1
            className="font-display text-2xl font-semibold mb-2"
            style={{ color: 'var(--ink)' }}
          >
            {t('404title')}
          </h1>

          <div
            className="w-12 h-px mx-auto my-4"
            style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}
          />

          <p
            className="text-sm max-w-sm mx-auto mb-8 leading-relaxed"
            style={{ color: 'var(--warm-stone)' }}
          >
            {t('404desc')}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--ink)' }}
          >
            <Home className="h-4 w-4" />
            {t('backHome')}
          </Link>
        </div>
      </div>
    </>
  )
}
