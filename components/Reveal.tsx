'use client'
import { useEffect, useRef, useState } from 'react'

export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true)
          o.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    o.observe(el)
    return () => o.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${v ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
