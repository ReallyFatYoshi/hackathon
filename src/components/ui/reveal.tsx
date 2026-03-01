'use client'

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react'

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

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animationDelay = `${delay}ms`
          el.classList.add(`reveal-${variant}`)
          el.classList.add('revealed')
          if (once) observer.unobserve(el)
        } else if (!once) {
          el.classList.remove(`reveal-${variant}`, 'revealed')
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, variant, threshold, once])

  return (
    <div ref={ref} className={`reveal-hidden ${className}`} style={style}>
      {children}
    </div>
  )
}
