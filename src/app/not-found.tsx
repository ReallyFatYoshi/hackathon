'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <html>
      <body style={{ margin: 0 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@400;500&display=swap');

          .error-root {
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
          .error-root::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
              radial-gradient(ellipse 60% 50% at 20% 80%, #C8892A08 0%, transparent 70%),
              radial-gradient(ellipse 40% 60% at 80% 20%, #C8892A06 0%, transparent 70%);
            pointer-events: none;
          }
          .error-content {
            position: relative;
            text-align: center;
            padding: 3rem 2rem;
            animation: errorIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          @keyframes errorIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .error-plate {
            width: 160px;
            height: 160px;
            border-radius: 50%;
            border: 2px solid #E5DDD0;
            margin: 0 auto 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: white;
            box-shadow: 0 0 0 8px #FAF8F4, 0 0 0 10px #E5DDD0;
          }
          .error-plate::after {
            content: '';
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 1px dashed #E5DDD0;
          }
          .error-code {
            font-family: 'Cormorant Garamond', serif;
            font-size: 3rem;
            font-weight: 300;
            color: #C8892A;
            letter-spacing: 0.08em;
          }
          .error-heading {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #0C0907;
          }
          .error-desc {
            font-size: 0.875rem;
            color: #6B6358;
            max-width: 360px;
            margin: 0 auto 2rem;
            line-height: 1.7;
          }
          .error-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: #0C0907;
            color: white;
            padding: 0.75rem 1.75rem;
            border-radius: 0.75rem;
            font-size: 0.8125rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s;
          }
          .error-link:hover {
            background: #C8892A;
            transform: translateY(-1px);
          }
          .error-divider {
            width: 48px;
            height: 1px;
            background: linear-gradient(90deg, transparent, #C8892A, transparent);
            margin: 1.5rem auto;
          }
        `}</style>
        <div className="error-root">
          <div className="error-content">
            <div className="error-plate">
              <span className="error-code">404</span>
            </div>
            <h1 className="error-heading">Page not found</h1>
            <div className="error-divider" />
            <p className="error-desc">
              The page you&apos;re looking for doesn&apos;t exist or has been moved. 
              Let&apos;s get you back to something delicious.
            </p>
            <Link href="/" className="error-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
