'use client'

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** Delay in ms before animation starts after element enters viewport */
  delay?: number
  /** Animation variant */
  variant?: 'fade-up' | 'fade-in' | 'scale-in' | 'fade-left' | 'fade-right'
  /** IntersectionObserver threshold (0-1) */
  threshold?: number
  /** Only animate once */
  once?: boolean
}

export function Reveal({
  children,
  className = '',
  style,
  delay = 0,
  variant = 'fade-up',
  threshold = 0.15,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setRevealed(false)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return (
    <div
      ref={ref}
      className={`${revealed ? `reveal-${variant}` : 'reveal-hidden'} ${className}`}
      style={{ ...style, animationDelay: revealed ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  )
}
