'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[MyChef Global Error]', error)
  }, [error])

  return (
    <html>
      <body style={{ margin: 0 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@400;500&display=swap');

          .ge-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #FAF8F4;
            font-family: 'DM Sans', sans-serif;
            color: #0C0907;
            position: relative;
            overflow: hidden;
          }
          .ge-root::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 60% 50% at 50% 50%, #C8892A08 0%, transparent 70%);
            pointer-events: none;
          }
          @keyframes geIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .ge-content {
            position: relative;
            text-align: center;
            padding: 4rem 2rem;
            animation: geIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          .ge-icon {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin: 0 auto 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border: 1.5px solid #E5DDD0;
            box-shadow: 0 4px 24px #0C090706;
          }
          .ge-code {
            font-family: 'Cormorant Garamond', serif;
            font-size: 4rem;
            font-weight: 300;
            letter-spacing: 0.08em;
            color: #C8892A40;
            margin-bottom: 0.5rem;
          }
          .ge-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.75rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
          }
          .ge-divider {
            width: 48px;
            height: 1px;
            background: linear-gradient(90deg, transparent, #C8892A, transparent);
            margin: 1.25rem auto;
          }
          .ge-desc {
            font-size: 0.875rem;
            color: #6B6358;
            max-width: 360px;
            margin: 0 auto 2rem;
            line-height: 1.7;
          }
          .ge-digest {
            font-size: 0.75rem;
            color: #A89E94;
            font-family: monospace;
            margin-bottom: 1.5rem;
          }
          .ge-actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }
          .ge-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-size: 0.8125rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
          }
          .ge-btn-primary {
            background: #0C0907;
            color: white;
          }
          .ge-btn-primary:hover { background: #C8892A; transform: translateY(-1px); }
          .ge-btn-secondary {
            background: transparent;
            color: #6B6358;
            border: 1px solid #E5DDD0;
          }
          .ge-btn-secondary:hover { border-color: #C8892A; transform: translateY(-1px); }
        `}</style>

        <div className="ge-root">
          <div className="ge-content">
            <div className="ge-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C8892A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
            </div>

            <p className="ge-code">500</p>
            <h1 className="ge-title">Something went wrong</h1>
            <div className="ge-divider" />
            <p className="ge-desc">
              An unexpected error occurred. Our team has been notified. 
              Please try again or return to the homepage.
            </p>

            {error.digest && (
              <p className="ge-digest">Error ID: {error.digest}</p>
            )}

            <div className="ge-actions">
              <button onClick={reset} className="ge-btn ge-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                Try again
              </button>
              <a href="/" className="ge-btn ge-btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
