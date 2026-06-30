'use client'

import { useEffect, useRef, useState } from 'react'

type Animation = 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight'

interface AnimatedRevealProps {
  children: React.ReactNode
  delay?: number
  animation?: Animation
  className?: string
}

const initialStyles: Record<Animation, string> = {
  fadeUp: 'opacity-0 translate-y-8',
  fadeIn: 'opacity-0',
  slideLeft: 'opacity-0 -translate-x-8',
  slideRight: 'opacity-0 translate-x-8',
}

const visibleStyles: Record<Animation, string> = {
  fadeUp: 'opacity-100 translate-y-0',
  fadeIn: 'opacity-100',
  slideLeft: 'opacity-100 translate-x-0',
  slideRight: 'opacity-100 translate-x-0',
}

export default function AnimatedReveal({
  children,
  delay = 0,
  animation = 'fadeUp',
  className = '',
}: AnimatedRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(el)
          return () => clearTimeout(timer)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={[
        'transition-all duration-700 ease-out',
        isVisible ? visibleStyles[animation] : initialStyles[animation],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
